/* eslint-disable no-param-reassign */
const path = require('path');
const os = require('os');
const fs = require('fs');
const runComposerCommand = require('../../util/run-composer');
const matchFilesystem = require('../../util/match-filesystem');
const moveFile = require('../../util/move-file');

const installMagento = {
    title: 'Installing Magento',
    task: async ({ magentoVersion, config: { config } }, task) => {
        const isFsMatching = await matchFilesystem(config.magentoDir, {
            'app/etc': [
                'env.php'
            ],
            'bin/magento': true,
            'composer.json': true,
            'composer.lock': true
        });

        if (isFsMatching) {
            task.skip();
            return;
        }

        task.title = 'Creating Magento project...';

        const tempDir = path.join(os.tmpdir(), `magento-tmpdir-${Date.now()}`);
        await runComposerCommand(
            `create-project \
        --repository=https://repo.magento.com/ magento/project-community-edition=${magentoVersion} \
        --no-install \
        "${tempDir}"`,
            { magentoVersion }
        );

        await moveFile({
            from: path.join(tempDir, 'composer.json'),
            to: path.join(process.cwd(), 'composer.json')
        });

        await fs.promises.rmdir(tempDir);

        try {
            await runComposerCommand('install',
                {
                    magentoVersion,
                    callback: (t) => {
                        task.output = t;
                    }
                });
        } catch (e) {
            if (e.message.includes('man-in-the-middle attack')) {
                throw new Error(`Probably you haven't setup pubkeys in composer.
                Please run composer diagnose in cli to get mode.\n\n${e}`);
            }

            throw new Error(`Unexpected error during composer install.\n\n${e}`);
        }
        task.title = 'Magento installed!';
    },
    options: {
        bottomBar: 10
    }
};

module.exports = installMagento;
