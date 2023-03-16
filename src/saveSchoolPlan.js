import { save } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";

export default async function saveSchoolPlan(){
    try {
    const savePath = await save();
    if (!savePath) return;
    await invoke("save_file", { path: savePath, contents: 'sez' });
    /**
     * Another option for  saving files but with a hard coded file name and directory:
     * await writeTextFile("test.txt", message.value, {
          dir: BaseDirectory.Desktop,
       });
     */
  } catch (err) {
    console.error(err);
  }
}
