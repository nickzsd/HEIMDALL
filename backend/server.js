import express from 'express';
import * as fs from 'node:fs/promises';
import XLSX from 'xlsx';
import cors from 'cors'; 

const app = express();

app.use(cors());
app.use(express.json());

app.post('/add_to_excel', async (req, res) => {
    const novaLinha = req.body;

    console.log('Nova linha recebida:', novaLinha);            

    const workbook = XLSX.readFile('./data/register.xlsx');
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];

    const dados = XLSX.utils.sheet_to_json(worksheet);

    dados.push(novaLinha);

    const novaPlanilha = XLSX.utils.json_to_sheet(dados);
    workbook.Sheets[sheetName] = novaPlanilha;

    XLSX.writeFile(workbook, './data/register.xlsx');

    console.log('Nova linha adicionada ao Excel.');
    res.json({ success: true, message: 'Linha adicionada ao Excel com sucesso!' });
});

app.delete('/delete_from_excel', async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: 'IDs inválidos.' });
    }

    try {
        const workbook = XLSX.readFile('./data/register.xlsx');
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        let dados = XLSX.utils.sheet_to_json(worksheet);                        

        dados = dados.filter(linha => !ids.includes(String(linha.user)));

        const novaPlanilha = XLSX.utils.json_to_sheet(dados);
        workbook.Sheets[sheetName] = novaPlanilha;

        XLSX.writeFile(workbook, './data/register.xlsx');

        res.json({ success: true, message: 'Registros deletados com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar registros:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar a exclusão.' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
