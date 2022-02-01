import { Octokit } from "octokit";
import * as fs from 'fs';


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


const includeUsesPullRequests = async (url) => {

    if (npull_requests_minimum > 30) {
        console.warn("Filter function does not account for pagination of the API--results may be affected.");
    }
    const [ owner, repo, ...unuseds ] = url.slice("https://github.com/".length).split('/');
    const pull_requests = await octokit.rest.pulls.list({
        owner,
        repo,
        state: 'all'
    });
    const npull_requests = pull_requests.data.length;
    return npull_requests >= npull_requests_minimum;
}


const includeUsesWorkflows = async (url) => {

    const [ owner, repo, ...unuseds ] = url.slice("https://github.com/".length).split('/');
    const { data: { total_count: nworkflows } } = await octokit.rest.actions.listRepoWorkflows({
        owner,
        repo,
    });
    return nworkflows >= nworkflows_minimum;
}


const hasMultipleChangesToCitationcff = async (url) => {

    const [ owner, repo, ...unuseds ] = url.slice("https://github.com/".length).split('/');

    const commits = await octokit.rest.repos.listCommits({
        owner,
        repo,
        path: 'CITATION.cff'
    });

    return commits.data.length > 1
}


const hasRecentCommits = async (url) => {
    const [ owner, repo, ...unuseds ] = url.slice("https://github.com/".length).split('/');

    const commits = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 1
    });

    const commit_date = new Date(commits.data[0].commit.author.date);
    const elapsed = Date.now() - commit_date

    return elapsed <= inactivity_threshold
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

const nworkflows_minimum = 1;
const npull_requests_minimum = 5;
const inactivity_threshold = 12 * 30 * 24 * 60 * 60 * 1000 // X months in milliseconds -> X months * 30 days/month * 24 hours/day * 60 min/hour * 60 sec/min * 1000

const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

let urls = urls_rsd;
urls = await filterAsync(urls, includeHasCitationcff);
urls = await filterAsync(urls, includeUsesPullRequests);
urls = await filterAsync(urls, hasMultipleChangesToCitationcff);
urls = await filterAsync(urls, includeUsesWorkflows);
urls = await filterAsync(urls, hasRecentCommits);
urls.forEach(url => console.log(url))


//const q = 'cffconvert-github-action in:file path:.github/workflows';
// const q = 'CITATION.cff in:path path:/';
// const { data } = await octokit.request('GET /search/code', { q });

//data.items.forEach((item) => {
//  console.log(item.repository.html_url);
//})
