import { Octokit } from "octokit";
import * as fs from 'fs';


const include_whitelisted = (url) => {
    const whitelist = [
        'https://github.com/3D-e-Chem/tycho-knime-node-archetype',
        'https://github.com/AA-ALERT/frbcatdb',
        'https://github.com/abrupt-climate/hyper-canny',
        'https://github.com/ADAH-EviDENce/evidence',
        'https://github.com/amusecode/amuse',
        'https://github.com/arabic-digital-humanities/adhtools',
        'https://github.com/arnikz/PIQMIe',
        'https://github.com/benvanwerkhoven/kernel_tuner',
        'https://github.com/c-martinez/BeyondTheBook',
        'https://github.com/c3s-magic/c3s-magic-wps',
        'https://github.com/candYgene/siga',
        'https://github.com/caselawanalytics/CaseLawAnalytics',
        'https://github.com/ci-for-science/self-hosted-runners',
        'https://github.com/citation-file-format/citation-file-format',
        'https://github.com/CLARIAH/grlc',
        'https://github.com/DeepRank/pssmgen',
        'https://github.com/dianna-ai/dianna',
        'https://github.com/DynaSlum/satsense',
        'https://github.com/e-mental-health/data-processing'
    ];
    return whitelist.includes(url);
}

const include_with_cff = async (url) => {

    const has_citationcff = (treeitem) => {
        return treeitem.path == 'CITATION.cff';
    };

    const [ owner, repo, ...unuseds ] = url.slice("https://github.com/".length).split('/');

    // const { data: { name } } = await octokit.rest.repos.
    // console.log(name);

    const { data: { tree } } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: 'master'
    });
    return tree.filter(has_citationcff).length == 1;
}

const data = fs.readFileSync('./urls.json', 'utf8');
const urls_all = JSON.parse(data);

const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

const urls = await urls_all.filter(include_whitelisted)
                           .filter(include_with_cff);

console.log(urls);


//const q = 'cffconvert-github-action in:file path:.github/workflows';
// const q = 'CITATION.cff in:path path:/';
// const { data } = await octokit.request('GET /search/code', { q });

//data.items.forEach((item) => {
//  console.log(item.repository.html_url);
//})
