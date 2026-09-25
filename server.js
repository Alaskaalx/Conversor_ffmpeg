const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const port = 3067; // A porta que você já estava usando

const upload = multer({ dest: 'upload/' });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função auxiliar para criar pasta de destino
function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------
// ROTA 1: CORTAR VÍDEO (Já corrigida)
// ---------------------------------------------------------
app.post('/api/video/cut', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum vídeo importado.' });

    const { startTime, endTime, resolution, outputDir } = req.body;
    const tempPath = req.file.path;
    const ext = path.parse(req.file.originalname).ext;
    const nameWithoutExt = path.parse(req.file.originalname).name;
    const finalFilename = `${nameWithoutExt}_cut_${Date.now()}${ext}`;
    
    ensureDir(outputDir);
    const outputPath = path.join(outputDir, finalFilename);

    let ffmpegCmd = `ffmpeg -i "${tempPath}" -ss ${startTime} -to ${endTime} -c:a copy`;
    if (resolution !== 'original') {
        ffmpegCmd += ` -vf scale=-1:${resolution} -c:v libx264 -crf 23 -preset fast`;
    } else {
        ffmpegCmd += ` -c:v copy`;
    }
    ffmpegCmd += ` "${outputPath}"`;

    exec(ffmpegCmd, (error) => {
        fs.unlinkSync(tempPath);
        if (error) return res.status(500).json({ error: 'Falha ao processar o vídeo.' });
        res.json({ success: true, message: 'Vídeo cortado', path: outputPath });
    });
});

// ---------------------------------------------------------
// ROTA 2: CONVERTER VÍDEO (Extensões diferentes)
// ---------------------------------------------------------
app.post('/api/video/convert', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum vídeo importado.' });

    const { targetFormat, outputDir } = req.body;
    const tempPath = req.file.path;
    const nameWithoutExt = path.parse(req.file.originalname).name;
    const finalFilename = `${nameWithoutExt}_convertido_${Date.now()}.${targetFormat}`;
    
    ensureDir(outputDir);
    const outputPath = path.join(outputDir, finalFilename);

    // Comando FFmpeg focado na mudança de container/extensão
    const ffmpegCmd = `ffmpeg -i "${tempPath}" -c:v copy -c:a copy "${outputPath}"`;

    exec(ffmpegCmd, (error) => {
        fs.unlinkSync(tempPath);
        if (error) return res.status(500).json({ error: 'Falha ao converter formato do vídeo.' });
        res.json({ success: true, message: 'Vídeo convertido', path: outputPath });
    });
});

// ---------------------------------------------------------
// ROTA 3: CONVERTER PDF PARA WORD (Usa o script Python)
// ---------------------------------------------------------
app.post('/api/pdf/convert', upload.single('pdf'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum PDF importado.' });

    const { outputDir } = req.body;
    const tempPath = req.file.path;
    const nameWithoutExt = path.parse(req.file.originalname).name;
    const finalFilename = `${nameWithoutExt}_${Date.now()}.docx`;
    
    ensureDir(outputDir);
    const outputPath = path.join(outputDir, finalFilename);

    // Chama o Python mandando o arquivo temporário e o destino do Word
    const pythonCmd = `python pdf2word.py "${tempPath}" "${outputPath}"`;

    exec(pythonCmd, (error, stdout) => {
        fs.unlinkSync(tempPath);
        if (error || stdout.includes("ERRO")) {
            return res.status(500).json({ error: 'Falha ao converter PDF pelo Python.' });
        }
        res.json({ success: true, message: 'PDF convertido para Word', path: outputPath });
    });
});

app.listen(port, () => {
    console.log(`Canivete rodando em http://localhost:${port}`);
});