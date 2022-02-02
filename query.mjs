import { Octokit } from "octokit";
import * as fs from 'fs';
import { execSync } from "child_process";

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
    const dockerCommand = `docker run --rm -i citationcff/cffconvert:2.0.0 --validate --url ${url}/tree/${default_branch}`;
    const outputWhenValid = "Citation metadata are valid according to schema";

    let result;
    try {
        result = execSync(dockerCommand, {stdio: ['pipe', 'pipe', 'ignore']});
    } catch {
        return false;
    }
    if (result === null) {
        return false;
    }
    return result.toString().startsWith(outputWhenValid);
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


const hasSufficientContributors = async (url) => {
    const [ owner, repo, ...unuseds ] = url.slice("https://github.com/".length).split('/');

    const contributors = await octokit.rest.repos.listContributors({
        owner,
        repo,
    });

    let ncontributors = 0
    for (const c of contributors.data) {
        if (c.contributions >= ncontributions_minimum) {
            ncontributors++;
        }
    }

    return ncontributors >= ncontributors_minimum;
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




const nworkflows_minimum = 1;
const npull_requests_minimum = 5;
const inactivity_threshold = 12 * 30 * 24 * 60 * 60 * 1000 // X months in milliseconds -> X months * 30 days/month * 24 hours/day * 60 min/hour * 60 sec/min * 1000
const ncontributors_minimum = 3;
const ncontributions_minimum = 5;

const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

let urls = loadFromJsonfile('./rsd-urls.json');
urls = await filterAsync(urls, includeHasCitationcff);
urls = await filterAsync(urls, includeUsesPullRequests);
urls = await filterAsync(urls, hasMultipleChangesToCitationcff);
urls = await filterAsync(urls, includeUsesWorkflows);
urls = await filterAsync(urls, hasRecentCommits);
urls = await filterAsync(urls, hasSufficientContributors);
urls = await filterAsync(urls, includeHasValidcff);
urls.forEach(url => console.log(url))
