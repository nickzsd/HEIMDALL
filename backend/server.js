// server.js
const express = require('express');
const fs = require('fs');
const XLSX = require('xlsx');
const app = express();

app.use(express.json());

app.post('/add-to-excel', (req, res) => {
    const novaLinha = req.body;
    
    const workbook = XLSX.readFile('./data/register.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const dados = XLSX.utils.sheet_to_json(worksheet);

    dados.push(novaLinha);
    
    const novaPlanilha = XLSX.utils.json_to_sheet(dados);
    workbook.Sheets[sheetName] = novaPlanilha;
    
    XLSX.writeFile(workbook, './data/register.xlsx');

    res.json({ success: true, message: 'Linha adicionada ao Excel com sucesso!' });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
