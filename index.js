const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
const bannermodel = require("./model/banner");
const imagemodel = require("./model/gallery");
const videomodel = require("./model/video");
const usermodel = require("./model/user");


const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, 
  };
  
  app.use(cors(corsOptions));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));
app.use(cookieParser());

mongoose.connect('mongodb://127.0.0.1:27017/Furniture', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

    
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

const storagevideo = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/videos');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const uploads = multer({ storage: storagevideo });


app.post('/addbanner', upload.single('banner'), (req, res) => {
    const data = {
        banner: req.file.filename,
    };

    bannermodel.create(data)
        .then(banner => res.json(banner))
        .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

app.get('/getbanner', (req, res) => {
    bannermodel.find({})
        .then(banner => res.json(banner))
        .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

app.delete('/deletebanner', (req, res) => {
    bannermodel.findOneAndDelete({})
        .then(() => res.json({ message: 'Banner deleted' }))
        .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

app.post('/addimage', upload.single('image'), (req, res) => {
    const data = {
        image: req.file.filename,
        disp: req.body.disp
    };

    imagemodel.create(data)
        .then(image => res.json(image))
        .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

app.get('/getimage', (req, res) => {
    imagemodel.find({})
        .then(image => res.json(image))
        .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

app.delete('/deleteimage/:id',(req,res)=>{
    const id = req.params.id;
    imagemodel.findByIdAndDelete({_id:id})
    .then(user=>res.json(user))
    .catch(err=>res.json(err))
})

app.post('/addvideo', uploads.single('video'), (req, res) => {
    const data = {
        video: req.file.filename,
        disp: req.body.disp
    };

    videomodel.create(data)
        .then(vdo => res.json(vdo))
        .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});

app.get('/getvideo', async (req, res) => {
    try {
      const videos = await videomodel.find();
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Error fetching videos' });
    }
  });

  app.delete('/deletevideo/:id',(req,res)=>{
    const id = req.params.id;
    videomodel.findByIdAndDelete({_id:id})
    .then(user=>res.json(user))
    .catch(err=>res.json(err))
})

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json("Token is Missing");
    }
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
            return res.status(401).json("Error with token");
        }
        if (decoded.role !== 'admin') {
            return res.status(403).json("Not admin");
        }
        next();
    });
};

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await usermodel.findOne({ email: email });
        if (!user) {
            return res.status(404).json("No record found");
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const token = jwt.sign({ email: user.email, role: user.role , id: user._id,username :user.username }, "jwt-secret-key", { expiresIn: '30d' });
            res.cookie('token', token);
            return res.json({ Status: "Success", role: user.role , id: user._id ,username :user.username  });
        }
        return res.status(401).json("Password is incorrect");
    } catch (error) {
        console.error(error);
        return res.status(500).json("Internal Server Error");
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password} = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await usermodel.create({ username, email, password: hash });
        return res.json("Success");
    } catch (error) {
        console.error(error);
        return res.status(500).json("Internal Server Error");
    }
});

app.get('/admindashboard', (req, res) => {
    if (!req.user || !req.user.isAdmin) { 
      return res.status(403).json('Not admin');
    }
    res.json('Success');
  });
  
 
app.get('/users', (req, res) => {
    usermodel.find({})
    .then(users => res.json(users))
    .catch(err => res.status(500).json(err));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
