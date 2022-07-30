const { getOctokit } = require('@actions/github');
const core = require('@actions/core');
const path = require('path');
const fs = require('fs');

const SEMETIC_REG = "\\d+.\\d+.\\d+";

async function run() {
    try {
        let fileName = core.getInput('source_file');
        let filePath = path.join(process.env.GITHUB_WORKSPACE, fileName);
        if (!fs.existsSync(filePath))
            return core.setFailed(`Source file ${fileName} does not exist.`);

        let content = fs.readFileSync(filePath);
        let regex = new RegExp(core.getInput('extraction_regex'));
        let matches = String(content).match(regex);
        if (!matches)
            return core.setFailed(`No match was found for the regex '${regex.toString()}'.`);
        let versionString = matches[matches.length - 1];

        let versionMatches = String(versionString).match(new RegExp(SEMETIC_REG));
        let version = versionMatches[versionMatches.length -1];
        core.info("Extracted version :"+ version);

        let message = core.getInput('tag_message', { required: false }).trim();
        
        let prefix = core.getInput('tag_prefix', { required: false }).trim();
        let tagName = `${prefix}${version}`;
        core.setOutput('version', version);
        core.setOutput('tagname', tagName);


        if (!process.env.hasOwnProperty('GITHUB_TOKEN') || process.env.GITHUB_TOKEN.trim().length === 0)
            return core.setFailed('Invalid or missing GITHUB_TOKEN.');
      
        let git = getOctokit(process.env.GITHUB_TOKEN, {});
        let repoID = process.env.GITHUB_REPOSITORY.split('/');
        let owner = repoID[0], repo = repoID[1];
        
        core.info("tag searching ...");
        let tags;
        try {
            tags = await git.rest.repos.listTags({owner, repo, per_page: 100});
        } catch (e) {
            core.warning('No tags were listed');
        }

        if (tags) {
            for (let tag of tags.data)
              if (tag.name.trim().toLowerCase() === tagName.trim().toLowerCase())
                return core.setFailed(`"${tag.name.trim()}" tag already exists.`);
        }


        core.info('Making tag...' + tagName);
        let tagReq = message.length > 0 ? {owner, repo, tag: tagName, message, object: process.env.GITHUB_SHA, type: 'commit'} 
        : {owner, repo, tag: tagName, message: tagName, object: process.env.GITHUB_SHA, type: 'commit'};
        let tag = await git.rest.git.createTag(tagReq);
        core.info(`Created tag ${tag.data.sha}`);

        core.info('Making reference...');
        let reference = await git.rest.git.createRef({owner, repo, ref: `refs/tags/${tag.data.tag}`, sha: tag.data.sha});
        core.info(`Reference ${reference.data.ref} available at ${reference.data.url}`);

        if (typeof tag === 'object' && typeof reference === 'object') {
        core.setOutput('tagsha', tag.data.sha);
        core.setOutput('taguri', reference.data.url);
        core.setOutput('tagmessage', message);
        }

        core.info('Successfully completed!');

    } catch (error) {
    core.warning(error.message);
  }
}

run();