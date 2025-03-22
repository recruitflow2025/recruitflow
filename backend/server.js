const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // For file uploads
const fs = require('fs'); // For creating the uploads directory
const pdf = require('pdf-parse'); // PDF text extraction
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth'); // DOCX text extraction

const app = express();
app.use(express.json());
const port = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200', // Allow requests from your Angular app
  credentials: true // Allow credentials (e.g., cookies) to be sent
}));
app.use(bodyParser.json());
// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // default XAMPP username
  password: '', // default XAMPP password
  database: 'recruitflow' // replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create the 'uploads' directory if it doesn't exist
    }
    cb(null, uploadDir); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });
let currentSearchIndex = 0;

// Function to extract text from a PDF
async function extractTextFromPDF(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const pdf = await pdfParse(data);
    return pdf.text;  // Return the text content of the PDF
  } catch (error) {
    console.error(`Error extracting text from PDF: ${filePath}`, error);
    return '';
  }
}

// Function to extract text from a DOCX
async function extractTextFromDOCX(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;  // Return the text content of the DOCX
  } catch (error) {
    console.error(`Error extracting text from DOCX: ${filePath}`, error);
    return '';
  }
}

// Function to search within a file for the keywords
async function searchInFile(filePath, keywords) {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    let fileText = '';

    // Extract text based on file type (PDF or DOCX)
    if (fileExtension === '.pdf') {
      fileText = await extractTextFromPDF(filePath);
    }

    if (fileExtension === '.docx') {
      fileText = await extractTextFromDOCX(filePath);
    }

    // If no valid text is extracted, return false
    if (!fileText) {
      console.log(`No text found in file: ${filePath}`);
      return false;
    }

    // Convert file text and keywords to lowercase for case-insensitive search
    fileText = fileText.toLowerCase();
    return keywords.every(keyword => fileText.includes(keyword.toLowerCase()));
  } catch (error) {
    console.error(`Error searching in file: ${filePath}`, error);
    return false;
  }
}

// Endpoint to handle file search with pagination
app.post('/search-files', async (req, res) => {
  const { keywords, page = 1, pageSize = 10 } = req.body;

  // Ensure we have at least one keyword
  if (!keywords || keywords.trim().length === 0) {
    return res.status(400).json({ message: 'At least one keyword is required' });
  }

  // Reset current search index for new search
  currentSearchIndex = 0;

  // Split keywords and process them
  const keywordList = keywords.split(',').map(keyword => keyword.trim());
  const uploadDir = './uploads';
  const files = fs.readdirSync(uploadDir);
  const totalFiles = files.filter(file => fs.lstatSync(path.join(uploadDir, file)).isFile()).length;

  // Calculate the range of files to process for the requested page
  const offset = (page - 1) * pageSize;
  const endIndex = offset + pageSize;

  // We need to only process files from the current search index onwards
  let matchedFiles = [];

  // Ensure we only start from the current search index (pagination logic)
  for (let i = currentSearchIndex; i < files.length && matchedFiles.length < pageSize; i++) {
    const file = files[i];
    const filePath = path.join(uploadDir, file);

    // Check if it's a file (not a directory) and if it is either a PDF or DOCX
    if (fs.lstatSync(filePath).isFile() && (filePath.endsWith('.pdf') || filePath.endsWith('.docx'))) {
      const found = await searchInFile(filePath, keywordList);

      if (found) {
        matchedFiles.push(filePath);
      }
    }

    // Update the search index for the next request
    currentSearchIndex = i + 1;
  }

  // Pagination: Calculate total pages based on the total number of files
  const totalPages = Math.ceil(totalFiles / pageSize);

  // Return matched files and pagination info
  res.json({
    data: matchedFiles,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total: totalFiles,
      totalPages: totalPages,
    },
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM user_info WHERE email = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      res.status(200).send({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  });
});

// API to handle form submission with file upload
app.post('/add_submission', upload.single('resume'), (req, res) => {
    const {
      firstName,
      lastName,
      middleName,
      email,
      phone,
      description,
      skillSet,
      userId
    } = req.body;
  
    const resumePath = req.file ? req.file.path : null; // Get the file path
  
    // Step 1: Fetch the latest sub_id from the database
    const getLatestSubIdQuery = 'SELECT sub_id FROM add_submission ORDER BY sub_id DESC LIMIT 1';
    db.query(getLatestSubIdQuery, (err, results) => {
      if (err) {
        console.error('Error fetching latest sub_id:', err);
        return res.status(500).send('Error fetching latest sub_id');
      }
  
      let newSubId = 'sub01'; // Default value if no records exist
  
      if (results.length > 0) {
        // Step 2: Extract the numeric part of the latest sub_id and increment it
        const latestSubId = results[0].sub_id; // e.g., 'sub01'
        const numericPart = parseInt(latestSubId.replace('sub', ''), 10); // Extract '01' and convert to number
        const nextNumericPart = numericPart + 1; // Increment by 1
        newSubId = 'sub' + nextNumericPart.toString().padStart(2, '0'); // Format as 'sub02', 'sub03', etc.
      }
  
      // Step 3: Insert the new record with the generated sub_id
      const insertQuery = `
        INSERT INTO add_submission 
        (first_name, last_name, middle_name, email, phone_number, description, skillset, resume, user_id, sub_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      db.query(
        insertQuery,
        [firstName, lastName, middleName, email, phone, description, skillSet, resumePath, userId, newSubId],
        (err, result) => {
          if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error saving data');
          }
          res.status(200).send({ message: 'Data saved successfully', sub_id: newSubId });
        }
      );
    });
  });
  app.get('/submissions', (req, res) => {
    const { filter, page = 1, pageSize = 10 } = req.query; // Default page=1, pageSize=10
    const offset = (page - 1) * pageSize; // Calculate offset for pagination
  
    let query, queryParams;
  
    if (filter) {
      // Filtered query
      query = `
        SELECT * FROM add_submission
        WHERE skillset LIKE ? OR description LIKE ?
        LIMIT ? OFFSET ?
      `;
      const searchTerm = `%${filter}%`;
      queryParams = [searchTerm, searchTerm, parseInt(pageSize), parseInt(offset)];
    } else {
      // Default query (no filter)
      query = `
        SELECT * FROM add_submission
        LIMIT ? OFFSET ?
      `;
      queryParams = [parseInt(pageSize), parseInt(offset)];
    }
  
    // Fetch paginated data
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).send('Error fetching data');
      }
  
      // Fetch total count for pagination
      let countQuery;
      if (filter) {
        countQuery = `
          SELECT COUNT(*) AS total FROM add_submission
          WHERE skillset LIKE ? OR description LIKE ?
        `;
      } else {
        countQuery = 'SELECT COUNT(*) AS total FROM add_submission';
      }
  
      db.query(countQuery, filter ? [`%${filter}%`, `%${filter}%`] : [], (err, countResult) => {
        if (err) {
          console.error('Error fetching total count:', err);
          return res.status(500).send('Error fetching total count');
        }
  
        const total = countResult[0].total; // Total number of records
        const totalPages = Math.ceil(total / pageSize); // Total pages
  
        res.status(200).json({
          data: results,
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total,
            totalPages,
          },
        });
      });
    });
  });
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});