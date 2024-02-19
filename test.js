const jikanjs = require("@mateoaranda/jikanjs");

const search = async () => {
    const results = await jikanjs.search("characters", "emilia",1);
    console.log(results)
    const r = [];
    results.data.forEach(result => {
        if(result.title_english != null) {
            r.push(result.title_english);
        }
        if(result.title_english == null && result.name !=null) {
            r.push(result.name);
        }
        
    });

    return r;
}

search().then(console.log);