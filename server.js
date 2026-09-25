const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { stdout, stderr } = require('process');

const app = express();
const port = 3067;

const upload = multer({ dest: 'upload/'});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/video/cut', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'nenhum video importado'});

    const { startTime, endTime, resolution, outputDir } = req.body;
    const tempPath = req.file.path;
    const originalName = req.file.originalname;

    const nameWithoutExt = path.parse(originalName).name;
    const ext = path.parse(originalName).ext;
    const finalFilename= `${nameWithoutExt}_cut_${Date.now()}${ext}`;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, finalFilename);

    let ffmpegCmd = `ffmpeg -i "${tempPath}" -ss ${startTime} -to ${endTime} -c:a copy`;

    if (resolution !== 'original') {
        ffmpegCmd += ` -vf scale=-1:${resolution} -c:v libx264 -crf 23 -preset fast`; 
    } else {
        ffmpegCmd += ` -c:v copy`;
    }

    ffmpegCmd += ` "${outputPath}"`;

    exec(ffmpegCmd, (error, stdout, stderr) => {
        fs.unlinkSync(tempPath);

        if (error) {
            console.error(`Erro no FFmpeg: ${error.message}`);
            return res.status(500).json({ error: 'falha ao processar o video.'});
        }

        res.json({ sucess: true, message: 'video cortado com sucesso', path: outputPath});
    });
});

app.listen(port, () =>{
    console.log(`canivete rodando em http:/localhost:${port}`);
})
