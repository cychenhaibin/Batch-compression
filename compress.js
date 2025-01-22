const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // 用于图片处理的库
const readline = require('readline');

// 创建一个读取用户输入的接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 压缩图片函数
async function compressImage(inputImagePath, outputImagePath, size) {
    try {
        const { width, height } = await sharp(inputImagePath).metadata();
        let { newWidth, newHeight } = size;

        if (width > height) {
            newHeight = Math.floor(height * (newWidth / width));
        } else {
            newWidth = Math.floor(width * (newHeight / height));
        }

        await sharp(inputImagePath)
            .resize(newWidth, newHeight)
            .toFile(outputImagePath);
        console.log(`压缩完成：${path.basename(inputImagePath)}`);
    } catch (error) {
        console.error(`无法处理图片文件：${error.message}`);
    }
}

// 主函数
async function readFiles() {
    return new Promise((resolve) => {
        rl.question("请输入需要压缩的文件夹路径：", async (inputFilePath) => {
            if (!fs.existsSync(inputFilePath)) {
                console.log('待压缩文件夹不存在！');
                resolve(0);
                return;
            }

            const outputRootPath = path.join(__dirname, 'compress');
            if (!fs.existsSync(outputRootPath)) {
                fs.mkdirSync(outputRootPath);
            }

            const inputLastPath = path.basename(inputFilePath);
            const outputFilePath = path.join(outputRootPath, inputLastPath);

            if (fs.existsSync(outputFilePath)) {
                console.log(`压缩文件夹 ${outputFilePath} 已存在！`);
                resolve(0);
                return;
            }

            fs.mkdirSync(outputFilePath);

            const files = fs.readdirSync(inputFilePath);
            const imageExts = ['.jpg', '.jpeg', '.png'];
            const compressSize = { newWidth: 400, newHeight: 400 };

            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                const ext = path.extname(file).toLowerCase();
                if (imageExts.includes(ext)) {
                    const inputImagePath = path.join(inputFilePath, file);
                    const outputImagePath = path.join(outputFilePath, file);

                    console.log(`${index}: ${file}`);
                    await compressImage(inputImagePath, outputImagePath, compressSize);
                }
            }

            console.log(`${inputLastPath} 总文件: ${files.length}`);
            rl.close();
            resolve(files.length);
        });
    });
}

// 执行主函数
readFiles().catch(console.error);