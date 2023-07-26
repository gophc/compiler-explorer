import path from 'path';
import fs from 'fs-extra';

async function travelFile(dir, properName, callBack) {
    let files = await fs.readdir(dir);
    await Promise.allSettled(files.map(async file => {
        if (!file || file[0] == '.') {
            return;
        }
        let pathname = path.join(dir, file);
        let stat = await fs.stat(pathname);
        if (stat.isDirectory()) {
            if (file == 'vendor') {
                return;
            }
            await travelFile(pathname, `${properName}/${file}`, callBack);
        } else if (stat.isFile()) {
            await callBack(pathname, properName, file);
        }
    }));
}

async function loadProjectContent(dir) {
    let files = [];
    await travelFile(dir, '', async (pathname, properName, file) => {
        if (pathname.endsWith('.md') || pathname.endsWith('.sum')
            || pathname.endsWith('.log') || pathname.endsWith('.exe')
            || pathname.endsWith('LICENSE')) {
            return;
        }
        let content = await fs.readFile(pathname);
        let tmp = {
            properName: `${properName}/${file}`,
            content: content.length,
            isIncluded: !pathname.endsWith('_test.go')
        };
        files.push(tmp);
    });
    return files;
}

const projMap = { swiss: `D:\\gitee\\swiss\\`, gophc: `D:\\gitee\\gophc\\` };
let proj = 'swiss';
let files = await loadProjectContent(projMap[proj]);
console.log(`${projMap[proj]} #${proj}`, files)