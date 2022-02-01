import { Octokit } from "octokit";
import * as fs from 'fs';
import { exec } from "child_process";

const loadFromJsonfile = (filename) => {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
}


const includeWhitelisted = (url) => {
    return whitelist.includes(url);
}


const includeHasCitationcff = async (url) => {

    const [ owner, repo, ...unuseds ] = url.slice("https://github.com/".length).split('/');

    const { data: { default_branch } } = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });

    const { data: { tree } } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: default_branch
    });
    return tree.filter(treeitem => treeitem.path == 'CITATION.cff').length == 1;
}


const includeHasValidcff = async (url) => {

    const [ owner, repo, ...unuseds ] = url.slice("https://github.com/".length).split('/');

    const { data: { default_branch } } = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });

    const cmd = `docker run --rm -i citationcff/cffconvert:2.0.0 --validate --url ${url}/tree/${default_branch}`

    const checkValidString = "Citation metadata are valid according to schema"

    const execPromise = (command) => {
        return new Promise(function(resolve, reject) {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout.trim());
            });
        });
    }

    let result;
    try {
        result = await execPromise(cmd);
        console.log('Success: ', url);
        if (result.includes(checkValidString)) {
            return true;
        }
    } catch (error) {
        console.error('Failed: ', url); 
    }

}


const filterAsync = async (arr, asyncCallback) => {
    const promises = arr.map(asyncCallback);
    const results = await Promise.all(promises);
    return results.map((result, index) => {
        return {
            result: result,
            value: arr[index]
        }
    })
    .filter(item => item.result === true)
    .map(item => item.value);
}


const urls_rsd = loadFromJsonfile('./urls.json');
const whitelist = loadFromJsonfile('./whitelist.json');

const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

let urls = urls_rsd;
urls = urls.filter(includeWhitelisted);
urls = await filterAsync(whitelist, includeHasCitationcff);
urls = await filterAsync(urls, includeHasValidcff);

console.log('urls: ', urls);


//const q = 'cffconvert-github-action in:file path:.github/workflows';
// const q = 'CITATION.cff in:path path:/';
// const { data } = await octokit.request('GET /search/code', { q });

//data.items.forEach((item) => {
//  console.log(item.repository.html_url);
//})
