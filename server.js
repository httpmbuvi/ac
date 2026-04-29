const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require('fs');
const multer = require('multer');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ancoweb')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// --- Database Models ---
const projectSchema = new mongoose.Schema({
    title: String,
    category: String,
    status: { type: String, default: 'Active' },
    date: { type: Date, default: Date.now },
    image: String,
    description: String,
    technologies: [String], // Array of strings
    link: String
});
const Project = mongoose.model('Project', projectSchema);

// --- Service Model ---
const serviceSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: String,
    image: String,
    packageTab: String // To link to the rate card tabs
});
const Service = mongoose.model('Service', serviceSchema);

// --- Skill Model ---
const skillSchema = new mongoose.Schema({
    name: String,
    category: String, // 'frontend', 'backend', 'tools'
    icon: String // devicon class or image url
});
const Skill = mongoose.model('Skill', skillSchema);

// --- Page Content Model (For dynamic text on Home, About, Contact) ---
const contentSchema = new mongoose.Schema({
    identifier: { type: String, unique: true }, // e.g. 'home_hero', 'about_info', 'contact_details'
    data: mongoose.Schema.Types.Mixed
});
const Content = mongoose.model('Content', contentSchema);

// --- Image Upload Configuration (Multer) ---
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes (Data Management) ---

// Get All Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ date: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Image Route
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return the path to the uploaded file
    res.json({ imageUrl: '/uploads/' + req.file.filename });
});

// List Uploaded Images (Admin)
app.get('/api/uploads', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Unable to scan directory' });
        }
        const fileList = files.map(file => ({
            name: file,
            url: '/uploads/' + file
        }));
        res.json(fileList);
    });
});

// Delete Uploaded Image (Admin)
app.delete('/api/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    // Basic security check
    if (filename.includes('..') || filename.includes('/')) {
        return res.status(400).json({ message: 'Invalid filename' });
    }
    const filepath = path.join(uploadDir, filename);
    fs.unlink(filepath, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to delete file' });
        res.json({ message: 'File deleted successfully' });
    });
});

// Add New Project (for development/admin use)
app.post('/api/projects', async (req, res) => {
    try {
        // Assumes the body is a JSON object matching the project schema
        const newProject = new Project(req.body);
        await newProject.save();
        // Respond with the created project and a 201 status code
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Project (for admin use)
app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Service Routes ---
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Services Management (Admin) ---
app.post('/api/services', async (req, res) => {
    try {
        const newService = new Service(req.body);
        await newService.save();
        res.status(201).json(newService);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Service deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Skills Management (Admin) ---
app.get('/api/skills', async (req, res) => {
    try {
        const skills = await Skill.find();
        res.json(skills);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/skills', async (req, res) => {
    try {
        const newSkill = new Skill(req.body);
        await newSkill.save();
        res.status(201).json(newSkill);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/skills/:id', async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Skill deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Page Content Management (Admin) ---
app.get('/api/content/:identifier', async (req, res) => {
    try {
        const content = await Content.findOne({ identifier: req.params.identifier });
        res.json(content ? content.data : {});
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/content', async (req, res) => {
    const { identifier, data } = req.body;
    try {
        const content = await Content.findOneAndUpdate(
            { identifier },
            { data },
            { new: true, upsert: true }
        );
        res.json(content);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Email Sending Route ---
const transporter = nodemailer.createTransport({
    // You need to configure your email provider here.
    // This uses the values from your .env file.
    // For Gmail, you might need to use an "App Password".
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER, // Your email address from .env file
        pass: process.env.EMAIL_PASS  // Your email password or app password from .env file
    }
});

app.post('/api/send-email', async (req, res) => {
    const { name, email, project } = req.body;

    if (!name || !email || !project) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`, // Use your own email to avoid being marked as spam
        // The email address that will receive form submissions.
        // It's best to set EMAIL_RECEIVER in your .env file to 'thomasantony372@gmail.com'
        to: process.env.EMAIL_RECEIVER || 'thomasantony372@gmail.com',
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        text: `You have a new message from your website contact form.\n\n` +
              `Name: ${name}\n` +
              `Email: ${email}\n` +
              `Message:\n${project}`,
        html: `<p>You have a new message from your website contact form.</p>` +
              `<h3>Contact Details</h3>` +
              `<ul>` +
              `  <li><strong>Name:</strong> ${name}</li>` +
              `  <li><strong>Email:</strong> ${email}</li>` +
              `</ul>` +
              `<h3>Message</h3>` +
              `<p>${project.replace(/\n/g, '<br>')}</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
});

// Middleware to serve .html files without extension (User Friendly)
app.use((req, res, next) => {
    if (req.method === 'GET' && !path.extname(req.path) && req.path !== '/') {
        const htmlFile = path.join(__dirname, req.path + '.html');
        if (fs.existsSync(htmlFile)) {
            return res.sendFile(htmlFile);
        }
    }
    next();
});

// --- Public Website ---
// Serve static files from root
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});