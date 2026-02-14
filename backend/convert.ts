import { AsyncFileDialog } from "@bindrs/rfd";
import { Database } from "bun:sqlite";

export default async function convert(){
    const fileHandle = await new AsyncFileDialog()
        .addFilter("JSON", ["json", "txt", "json5"])
        .setTitle("选择JSON文件")
        .pickFile();
    if(!fileHandle){
        return '没有选择文件';
    };
    const src = await Bun.file(fileHandle.path()).json();
    const db = new Database(':memory:');
    return '';
};

if(import.meta.main){
    console.log(await convert());
};