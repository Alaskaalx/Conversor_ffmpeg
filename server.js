const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const port = 3067;

const upload = multer({ dest: 'upload/' });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------
// ROTA 1A: CORTAR VÍDEO (Tempo Exato)
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
// ROTA 1B: DIVIDIR VÍDEO EM N PARTES IGUAIS
// ---------------------------------------------------------
app.post('/api/video/split', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum vídeo importado.' });

    const { parts, outputDir } = req.body;
    const tempPath = req.file.path;
    const ext = path.parse(req.file.originalname).ext;
    const nameWithoutExt = path.parse(req.file.originalname).name;
    
    ensureDir(outputDir);

    // 1. Usa o ffprobe para pegar a duração exata em segundos
    const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempPath}"`;
    
    exec(probeCmd, (err, stdout) => {
        if (err) {
            fs.unlinkSync(tempPath);
            return res.status(500).json({ error: 'Falha ao ler duração do vídeo.' });
        }
        
        const totalDuration = parseFloat(stdout.trim());
        const segmentTime = totalDuration / parseInt(parts, 10);
        
        // Padrão de saída: nome_parte_001.mp4, nome_parte_002.mp4...
        const outPattern = path.join(outputDir, `${nameWithoutExt}_parte_%03d${ext}`);
        
        // 2. Executa o fatiamento no FFmpeg
        const ffmpegCmd = `ffmpeg -i "${tempPath}" -c copy -map 0 -segment_time ${segmentTime} -f segment -reset_timestamps 1 "${outPattern}"`;
        
        exec(ffmpegCmd, (error) => {
            fs.unlinkSync(tempPath);
            if (error) return res.status(500).json({ error: 'Falha ao dividir o vídeo.' });
            res.json({ success: true, message: `Vídeo dividido em ${parts} partes`, path: outputDir });
        });
    });
});

// ---------------------------------------------------------
// ROTA 2: CONVERTER VÍDEO (Extensões)
// ---------------------------------------------------------
app.post('/api/video/convert', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum vídeo importado.' });

    const { targetFormat, outputDir } = req.body;
    const tempPath = req.file.path;
    const nameWithoutExt = path.parse(req.file.originalname).name;
    const finalFilename = `${nameWithoutExt}_convertido_${Date.now()}.${targetFormat}`;
    
    ensureDir(outputDir);
    const outputPath = path.join(outputDir, finalFilename);

    const ffmpegCmd = `ffmpeg -i "${tempPath}" -c:v copy -c:a copy "${outputPath}"`;

    exec(ffmpegCmd, (error) => {
        fs.unlinkSync(tempPath);
        if (error) return res.status(500).json({ error: 'Falha ao converter formato.' });
        res.json({ success: true, message: 'Vídeo convertido', path: outputPath });
    });
});

// ---------------------------------------------------------
// ROTA 3: CONVERTER PDF PARA WORD
// ---------------------------------------------------------
app.post('/api/pdf/convert', upload.single('pdf'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum PDF importado.' });

    const { outputDir } = req.body;
    const tempPath = req.file.path;
    const nameWithoutExt = path.parse(req.file.originalname).name;
    const finalFilename = `${nameWithoutExt}_${Date.now()}.docx`;
    
    ensureDir(outputDir);
    const outputPath = path.join(outputDir, finalFilename);

    const pythonCmd = `python pdf2word.py "${tempPath}" "${outputPath}"`;

    exec(pythonCmd, (error, stdout) => {
        fs.unlinkSync(tempPath);
        if (error || stdout.includes("ERRO")) return res.status(500).json({ error: 'Falha no Python.' });
        res.json({ success: true, message: 'Convertido para Word', path: outputPath });
    });
});

app.post('/api/pdf/to-image', upload.single('pdf'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum PDF importado.'});

    const { outputDir} = req.body;
    const tempPath = req.file.path;
    const nameWithoutExt = path.parse(req.file.originalname).name;

    ensureDir(outputDir);

    const pythonCmd = `python pdf2image.py "${tempPath}" "${outputDir}" "${nameWithoutExt}"`;

    exec(pythonCmd, (error, stdout) => {
        fs.unlinkSync(tempPath);
        if (error || stdout.includes("ERRO")) return res.status(500).json({ error: 'Falha ao extrair imagens do PDF.' });
        res.json({ success: true, message: 'Página extraidas como JPG', path: outputDir })
    });

});

app.listen(port, () => {
    console.log(`Canivete rodando na porta http://localhost:${port}`);
});