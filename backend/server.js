import express, { raw } from 'express';
import XLSX from 'xlsx';
import cors from 'cors'; 

const app = express();

app.use(cors());
app.use(express.json());

function excelDateToJSDate(serial) {
    const date = new Date(1899, 11, 30);
    date.setDate(date.getDate() + serial);
    return date;
}

function getTableId(id){
    let tablePath;
    switch(id)
    {
        //parametros
        case 'parameters':
            tablePath = './data/parameters.xlsx';
            break;
        case 'company':
            tablePath = './data/company.xlsx';
            break;
        case 'projects':
            tablePath = './data/projects.xlsx';
            break;
        case 'projects_tasks':
            tablePath = './data/projects_tasks.xlsx';
            break;

        //cadatros
        case 'users':
            tablePath = './data/register.xlsx';
            break;

        //Funcionalidades        
        case 'tickets':
            tablePath = './data/tickets.xlsx';
            break;
        case 'tickets_details':
            tablePath = './data/tickets_details.xlsx';
            break;

        //notificação
        case 'notifications':
            tablePath = './data/notifications.xlsx';
            break;
    }

    return tablePath;
}

function getparmsjson(){    
    const tableid  = 'parameters';   

    const commonTable = getTableId(tableid);    

    const workbook  = XLSX.readFile(commonTable);
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);    

    return json;
}

app.post('/get_nextRecid', (req, res) => {
    const bodyData = req.body;
    const tableid  = bodyData.tableid;
    const commonTable = getTableId(tableid);

    const workbook  = XLSX.readFile(commonTable);
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);    

    let maxNumber = 0;

    json.forEach(refRecord => {
        try {
            console.log(refRecord);

            const currentNum = refRecord.Recid ? refRecord.Recid : null;                             

            if (currentNum != null && currentNum > maxNumber)
                maxNumber = currentNum;            
        } catch (err) {
            // ignora 
        }
    });

    console.log(`dados-recid: ${json}\n\n-numero maximo: ${maxNumber}\n-proximo numero: ${maxNumber + 1}`);

    const nextNum = maxNumber + 1;    
    res.json({ nextRecid: nextNum });
});

app.post('/get_nextnum', (req, res) => {
    const bodyData = req.body;
    const tableid  = bodyData.tableid;

    let parmConst, parmcode;           

    if(Object.keys(bodyData).length > 1){
        parmConst = bodyData.const
        parmcode  = bodyData.code         
    } else { 
        const parm = getparmsjson()[0];     
        parmConst = tableid === 'users' ? parm.UserSequence : parm.TicketSequence;
        parmcode  = tableid === 'users' ? parm.UserCode : parm.TicketCode;
    }    

    const commonTable = getTableId(tableid); 
    const workbook  = XLSX.readFile(commonTable);
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);

    let maxNumber = 0;

    json.forEach(refRecord => {
        try {
            const rawValue = tableid === 'users' ? refRecord.user : refRecord.ticketId;            
            const currentNum = rawValue ? parseInt(rawValue.replace(parmConst, '')) : null;                             

            if (currentNum !== null && currentNum > maxNumber) {
                maxNumber = currentNum;
            }
        } catch (err) {
            // ignora 
        }
    });

    const nextNum = maxNumber + 1;
       
    function formatCode(_parmcode, number) {
        const numLength = _parmcode.length;
        return String(number).padStart(numLength, '0');
    }

    const nextCode = (parmConst + formatCode(parmcode, nextNum)).toString().trim();    

    res.json({ code: nextCode });
});

app.post('/find', async (req,res) => {
    const bodyData = req.body;
    const tableid  = bodyData.tableid;
    const query    = bodyData.query;            

    const commonTable = getTableId(tableid);

    const workbook  = XLSX.readFile(commonTable);
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];
    let  json = XLSX.utils.sheet_to_json(worksheet);    
    
    if(tableid == "notifications") {
        json = json.map(row => {
            if (typeof(row.NF_Date) == Number || typeof(row.NF_Date) == 'number') {
                row.NF_Date = (new Date(excelDateToJSDate(row.NF_Date))).toLocaleDateString('pt-BR');
            }
            return row;
        });
    } else if (tableid == "tickets") {        
        json = json.map(TK_row => {            
            
            if (typeof(TK_row.createdDate) == Number || typeof(TK_row.createdDate) == 'number')
                TK_row.createdDate = (new Date(excelDateToJSDate(TK_row.createdDate))).toLocaleDateString('pt-BR');            

            if (typeof(TK_row.updateDate) == Number || typeof(TK_row.updateDate) == 'number')                 
                TK_row.updateDate = (new Date(excelDateToJSDate(TK_row.updateDate))).toLocaleDateString('pt-BR'); 
            
            if (typeof(TK_row.ClosedDate) == Number || typeof(TK_row.ClosedDate) == 'number')                 
                TK_row.ClosedDate = (new Date(excelDateToJSDate(TK_row.ClosedDate))).toLocaleDateString('pt-BR'); 

            return TK_row;
        })
    } else if (tableid == "tickets_details") {        
        json = json.map(TK_row => {            
            
            if (typeof(TK_row.createdDate) == Number || typeof(TK_row.createdDate) == 'number')
                TK_row.createdDate = (new Date(excelDateToJSDate(TK_row.createdDate))).toLocaleDateString('pt-BR');

            return TK_row;
        })
    }
    
    if(query)
        json = json.filter(row =>
            Object.entries(query).every(([key, condition]) => {
                if (typeof condition === 'string') {
                    const match = condition.match(/^(>=|<=|!=|>|<|=)(.+)$/);
                    if (match) {
                        const operator = match[1];
                        const value = match[2].trim();
        
                        const rowValue = row[key];
        
                        switch (operator) {
                            case '!=': return rowValue != value;
                            case '>=': return rowValue >= value;
                            case '<=': return rowValue <= value;
                            case '>':  return rowValue > value;
                            case '<':  return rowValue < value;
                            case '=':  return rowValue == value;
                            default:   return false;
                        }
                    } else                     
                        return row[key] == condition;                    
                } else                     
                    return row[key] == condition;                
            })
        );                     
        
    res.json({json});
});    

app.post('/get_existlogin', async (req,res) => {
    const reqData  = req.body;
    
    const login    = reqData.email, 
          password = reqData.senha, 
          type     = reqData.currentUser;

    const workbook = XLSX.readFile('./data/register.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);    

    const refuser = json.find(u =>
        u.user?.toString().trim()       === login ||
        u.user_name?.toString().trim()  === login ||
        u.email?.toString().trim()      === login
    );    

    if (!refuser || refuser.register_type != type) {
        const logInfo = (type + " não localizado.");        
        res.json({success: false, infolog: logInfo});             
    }            

    if (refuser.acess_key.toString().trim() === password.toString().trim())           
        res.json({success: true, infolog: refuser});     
    else
        res.json({success: true, infolog: "Senha incorreta."});    
});

app.post('/table_States', async (req, res) => {
    const bodyData = req.body;
    const tableid  = bodyData.tableid;
    const type     = bodyData.type;
    const newData  = bodyData.data;
    const query    = bodyData.query;

    console.log('novos dados');    
    console.log(newData);
    console.log('query'); 
    console.log(query);
                
    const commonTable = getTableId(tableid);

    const workbook  = XLSX.readFile(commonTable);
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];

    let data = XLSX.utils.sheet_to_json(worksheet);
    
    if(tableid == "notifications")
        data = data.map(row => {
            if (typeof(row.NF_Date) == Number) {
                row.NF_Date = (new Date(excelDateToJSDate(row.NF_Date))).toLocaleDateString('pt-BR');
            }
            return row;
        });
    
    console.log('antes');    
    console.log(data);
    console.log("============")    

    switch(type)
    {
        case 'insert':
            data.push(newData);
            break;
        case 'delete':            
            data = data.filter(row =>
                !Object.entries(query).every(([key, value]) => row[key] === value)
            );        
            break;
            case 'update':
                const rowIndex = data.findIndex(row =>
                    Object.entries(query).every(([key, value]) => row[key] === value)
                );
            
                if (rowIndex !== -1) {                    
                    Object.entries(newData).forEach(([key, value]) => {
                        data[rowIndex][key] = value;
                    });
                }
                break;
            
    }    

    console.log('depois');
    console.log(data);

    console.log('\n\n\n');

    const newTable = XLSX.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = newTable;

    XLSX.writeFile(workbook, commonTable);
    
    res.json({ success: true, message: 'Registro adicionado/editado/deletado com sucesso!' });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});