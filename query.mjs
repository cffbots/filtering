import { Octokit } from "octokit";
import * as fs from 'fs';


const include_whitelisted = (url) => {
    const whitelist = [
      'https://github.com/3D-e-Chem/knime-kripodb',
      'https://github.com/3D-e-Chem/knime-molviewer'
    ];
    return whitelist.includes(url);
}

const data = fs.readFileSync('./urls.json', 'utf8');
const urls_all = JSON.parse(data);

console.log(urls_all);

const urls = urls_all.filter(include_whitelisted);

console.log(urls);


//const octokit = new Octokit({auth: `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`});

//const q = 'cffconvert-github-action in:file path:.github/workflows';
// const q = 'CITATION.cff in:path path:/';
// const { data } = await octokit.request('GET /search/code', { q });

//data.items.forEach((item) => {
//  console.log(item.repository.html_url);
//})
