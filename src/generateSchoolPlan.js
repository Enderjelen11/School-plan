import { save } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";

export default function generatePlan(classes){
    classes.map(c=>{
        console.log(c);
    })
}

async function saveSchoolPlan(){
    try {
    const savePath = await save();
    if (!savePath) return;
    await invoke("save_file", { path: savePath, contents: 'test' });
    /**
     */
  } catch (err) {
    console.error(err);
  }
}
