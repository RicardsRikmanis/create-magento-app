/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../../util/run-magento');

/**
 * TODO move this block inside theme folder as post installation command
 */
const themeSubtask = {
    task: async ({ ports }, task) => {
        task.output = 'Setting up redis...';

        try {
            await runMagentoCommand(`setup:config:set \
        --pq-host=localhost \
        --pq-port=${ports.redis} \
        --pq-database=5 \
        --pq-scheme=tcp \
        -n`, {
                callback: (t) => {
                    task.output = t;
                }
            });
            task.output = 'redis is set for persistent query!';
        } catch (e) {
            throw new Error(
                `Unexpected error while setting redis for pq!.
                See ERROR log below.\n\n${e}`
            );
        }
    }
};

module.exports = themeSubtask;
