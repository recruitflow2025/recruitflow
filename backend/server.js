const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // For file uploads
const fs = require('fs'); // For creating the uploads directory

const app = express();
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
  port: 3306,
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

// Login API
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