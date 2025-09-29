import { createClient } from "@supabase/supabase-js";

const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucnJ0c2lrZmJxZGdrd2lranRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzYzNjMsImV4cCI6MjA3MjIxMjM2M30.df-98yWbV-9pKu93zCTW5SjnX0cI8ZLkKFMukU-_6Mc"
const supabaseURL = "https://bnrrtsikfbqdgkwikjtf.supabase.co"

const supabase = createClient(supabaseURL, anonKey);

export default function mediaUpload(file){
    return new Promise((resolve, reject)=>{
        if(file == null){
            reject("File is not selected");
        }else{
            const timestamp = new Date().getTime();
            const fileName = timestamp+file.name;

            supabase.storage
                .from("images")
                .upload(fileName, file, {
                    upsert: false,
                    cacheControl:3600
        }).then(
            ()=>{
                const publicUrl = supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl;
                resolve(publicUrl);     
            }).catch(()=>{
                reject("Error in uploading file...")
            })
        }
    });
}