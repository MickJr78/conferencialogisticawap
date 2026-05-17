require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465,
  secure: process.env.SMTP_SECURE !== 'false',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const DEFAULT_TO_EMAIL = process.env.EMAIL_TO;

app.get('/', (req, res) => {
  res.send('Servidor de envio de relatório está ativo.');
});

app.post('/send-email', async (req, res) => {
  try {
    const { dados } = req.body;

    if (!dados) {
      return res.status(400).send('Dados insuficientes.');
    }

    if (!DEFAULT_TO_EMAIL) {
      return res.status(500).send('Destinatário de e-mail não configurado. Defina EMAIL_TO.');
    }

    const pdfBuffer = await gerarPdfBuffer(dados);
    const info = await transporter.sendMail({
      from: DEFAULT_FROM_EMAIL,
      to: DEFAULT_TO_EMAIL,
      subject: `Relatório de Conferência Logística - ${dados.tipoOperacao}`,
      text: gerarTextoEmail(dados),
      attachments: [
        {
          filename: 'conferencia-logistica.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    console.log('E-mail enviado:', info.messageId);
    res.status(200).json({ message: 'E-mail enviado com sucesso.' });
  } catch (error) {
    console.error('Erro no envio de e-mail:', error);
    res.status(500).send('Erro ao enviar e-mail: ' + error.message);
  }
});

function gerarTextoEmail(dados) {
  const resumo = dados.resumoFinal
    .map(prod => `${prod.codigo} - ${prod.descricao} → ${prod.total} caixas`)
    .join('\n');

  return `Olá,\n\nSegue o relatório da conferência logística.\n\nConferente: ${dados.nomeConferente}\nOperação: ${dados.tipoOperacao}\nData/Hora: ${dados.dataHora}\n\nResumo dos produtos:\n${resumo}\n\nAtenciosamente,\nEquipe de Conferência`;
}

function gerarPdfBuffer(dados) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Relatório de Conferência Logística', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Operação: ${dados.tipoOperacao}`);
    doc.text(`Conferente: ${dados.nomeConferente}`);
    doc.text(`Data/Hora: ${dados.dataHora}`);
    doc.moveDown();

    dados.resumoFinal.forEach((produto, index) => {
      doc.fontSize(12).fillColor('#111').text(`${index + 1}. ${produto.codigo} - ${produto.descricao}`);
      doc.fontSize(10).fillColor('#333').text(`   NF: ${produto.nf}`);
      doc.text(`   Total do Produto: ${produto.total} caixas`);
      produto.pallets.forEach(pallet => {
        doc.text(`      • Pallet ${pallet.numero}: ${pallet.status.toUpperCase()} — ${pallet.quantidade} caixas`);
      });
      doc.moveDown();
    });

    if (dados.fotoCarreta) {
      doc.moveDown();
      doc.fontSize(12).text(`Foto da carreta finalizada: ${dados.fotoCarreta}`);
    }

    doc.end();
  });
}

app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
  console.log(`Remetente padrão configurado: ${DEFAULT_FROM_EMAIL}`);
  console.log('Configure as variáveis de ambiente EMAIL_USER, EMAIL_PASS e EMAIL_FROM antes de enviar.');
});
