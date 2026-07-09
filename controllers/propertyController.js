const propertyService = require('../services/propertyService');
const billService = require('../services/billService');

const ExcelJS = require('exceljs');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');



const XLSX = require('xlsx');


// List
exports.list = async (req, res) => {

    const filters = {
        code: req.query.code || '',
        occupant: req.query.occupant || '',
        neighborhood: req.query.neighborhood || ''
    };

    const properties = await propertyService.getAll(filters);

    res.render('properties/list', {
        user: req.session.user,
        properties,
        filters
    });
};

// Show form
exports.createPage = (req, res) => {
    res.render('properties/create', {
        user: req.session.user
    });
};

// Create
exports.create = async (req, res) => {
    await propertyService.create(req.body);
    res.redirect('/properties');
};

// Delete
exports.delete = async (req, res) => {
    await propertyService.remove(req.params.id);
    res.redirect('/properties');
};

exports.details = async (req, res) => {

    const property = await propertyService.getById(req.params.id);

    const bills = await billService.getBillsByPropertyId(req.params.id);
    console.log(bills);
    res.render('properties/details', {
        user: req.session.user,
        property,
        bills
    });
};

exports.editPage = async (req, res) => {

    const property = await propertyService.getById(req.params.id);

    if (!property) {
        return res.redirect('/properties');
    }

    res.render('properties/edit', {
        user: req.session.user,
        property
    });

};

exports.update = async (req, res) => {

    await propertyService.update(req.params.id, req.body);

    res.redirect('/properties/' + req.params.id);

};



exports.importPage = (req,res)=>{

    res.render('properties/import',{
        user:req.session.user
    });

};



exports.importExcel = async (req, res) => {

    try {

        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.readFile(req.file.path);


        const worksheet = workbook.worksheets[0];


console.log("Rows:", worksheet.rowCount);
console.log("Columns:", worksheet.columnCount);


        let inserted = 0;
        let skipped = 0;

        let batchCount = 0;


        const BATCH_SIZE = 100;


        const rows = [];

        worksheet.eachRow((row, rowNumber) => {
        
            if (rowNumber === 1)
                return;
        
            rows.push({
        
                owner: row.getCell(2).text.trim(),
        
                ownerPhone: row.getCell(3).text.trim(),
        
                occupant: row.getCell(4).text.trim(),
        
                occupantPhone: row.getCell(5).text.trim(),
        
                description: row.getCell(6).text.trim(),
        
                floor: row.getCell(7).text.trim(),
        
                propertyType: row.getCell(8).text.trim(),
        
                category: row.getCell(9).text.trim() || 'D',
        
                hasWater: row.getCell(10).text.trim() === 'نعم',
        
                hasTrash: row.getCell(11).text.trim() === 'نعم',
        
                hasExemption: row.getCell(12).text.trim() === 'نعم'
        
            });
        
        });



        for (let i = 0; i < rows.length; i += BATCH_SIZE) {


            const batch =
                rows.slice(i, i + BATCH_SIZE);



            for (const item of batch) {


                if (!item.owner ||
                    item.owner.toString().trim() === '') {


                    skipped++;
                    continue;

                }



                await propertyService.create({

                    owner: item.owner,
                
                    ownerPhone: item.ownerPhone,
                
                    occupant: item.occupant,
                
                    occupantPhone: item.occupantPhone,
                
                    description: item.description,
                
                    floor: item.floor,
                
                    propertyType: item.propertyType,
                
                    neighborhood: worksheet.name, // since each exported file is one neighborhood
                
                    category: item.category || 'D',
                
                    hasWater: item.hasWater,
                
                    hasTrash: item.hasTrash,
                
                    hasExemption: item.hasExemption
                
                });


                inserted++;


            }


            console.log(
                `Imported ${Math.min(i+BATCH_SIZE, rows.length)} / ${rows.length}`
            );


            await new Promise(resolve =>
                setTimeout(resolve,100)
            );


        }



        res.redirect("/properties")



    } catch(error){


        console.error(error);


        res.status(500).send(
            "حدث خطأ أثناء استيراد الملف"
        );


    }

};

exports.exportExcel = async (req, res) => {

    try {

        const neighborhoods =
            await propertyService.getNeighborhoods();

        const exportFolder = path.join(
            __dirname,
            '../temp/exports'
        );

        if (!fs.existsSync(exportFolder)) {
            fs.mkdirSync(exportFolder, { recursive: true });
        }

        // create one excel for every neighborhood

        for (const neighborhood of neighborhoods) {

            const properties =
                await propertyService.getByNeighborhood(neighborhood);

            const workbook = new ExcelJS.Workbook();

            const sheet = workbook.addWorksheet(neighborhood);

            sheet.columns = [

                { header: 'رمز العقار', key: 'propertyCode', width: 18 },
                { header: 'المالك', key: 'owner', width: 30 },
                { header: 'هاتف المالك', key: 'ownerPhone', width: 18 },
                { header: 'المكلف', key: 'occupant', width: 30 },
                { header: 'هاتف المكلف', key: 'occupantPhone', width: 18 },
                { header: 'الوصف', key: 'description', width: 35 },
                { header: 'الطابق', key: 'floor', width: 10 },
                { header: 'نوع العقار', key: 'propertyType', width: 18 },
                { header: 'الفئة', key: 'category', width: 10 },
                { header: 'مياه', key: 'water', width: 10 },
                { header: 'نفايات', key: 'trash', width: 10 },
                { header: 'إعفاء', key: 'exemption', width: 10 }

            ];

            properties.forEach(p => {

                sheet.addRow({

                    propertyCode: p.propertyCode,
                    owner: p.owner,
                    ownerPhone: p.ownerPhone,
                    occupant: p.occupant,
                    occupantPhone: p.occupantPhone,
                    description: p.description,
                    floor: p.floor,
                    propertyType: p.propertyType,
                    category: p.category,
                    water: p.hasWater ? 'نعم' : 'لا',
                    trash: p.hasTrash ? 'نعم' : 'لا',
                    exemption: p.hasExemption ? 'نعم' : 'لا'

                });

            });

            sheet.getRow(1).font = {
                bold: true
            };

            const fileName =
                `${neighborhood}.xlsx`;

            await workbook.xlsx.writeFile(
                path.join(exportFolder, fileName)
            );

        }

        // create zip

        const zipName =
            `properties_${Date.now()}.zip`;

        const zipPath =
            path.join(exportFolder, zipName);

        const output =
            fs.createWriteStream(zipPath);

        const archive =
            archiver('zip', {
                zlib: { level: 9 }
            });

        archive.pipe(output);

        fs.readdirSync(exportFolder)
            .filter(f => f.endsWith('.xlsx'))
            .forEach(file => {

                archive.file(

                    path.join(exportFolder, file),

                    { name: file }

                );

            });

        await archive.finalize();

        output.on('close', () => {

            res.download(zipPath, zipName, () => {

                // cleanup

                fs.readdirSync(exportFolder)
                    .forEach(file => {

                        fs.unlinkSync(
                            path.join(exportFolder, file)
                        );

                    });

            });

        });

    } catch (err) {

        console.error(err);

        res.status(500).send("خطأ أثناء التصدير");

    }

};