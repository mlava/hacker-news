const createBlock = (params) => {
    const uid = window.roamAlphaAPI.util.generateUID();
    return Promise.all([
        window.roamAlphaAPI.createBlock({
            location: {
                "parent-uid": params.parentUid,
                order: params.order,
            },
            block: {
                uid,
                string: params.node.text
            }
        })
    ].concat((params.node.children || []).map((node, order) =>
        createBlock({ parentUid: uid, order, node })
    )))
};

var HNHeader;
var CP = true;

export default {
    onload: ({ extensionAPI }) => {
        const config = {
            tabTitle: "Hacker News",
            settings: [
                {
                    id: "hn-header",
                    name: "Header text",
                    description: "Heading under which to place imported items",
                    action: { type: "input", placeholder: "Hacker News Top Items:" },
                },
            ]
        };
        extensionAPI.settings.panel.create(config);

        extensionAPI.ui.commandPalette.addCommand({
            label: "Hacker News import",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before importing from Hacker News");
                    return;
                }
                fetchHN(CP).then(async (blocks) => {
                    const parentUid = uid || await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
                    await window.roamAlphaAPI.updateBlock(
                        { block: { uid: parentUid, string: HNHeader.toString(), open: true } });
                    blocks.forEach((node, order) => createBlock({
                        parentUid,
                        order,
                        node
                    }))
                });
            },
        });

        const args = {
            text: "HACKERNEWS",
            help: "Import top items from Hacker News",
            handler: (context) => fetchHN,
        };

        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.registerCommand(args);
        } else {
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                () =>
                    window.roamjs?.extension.smartblocks &&
                    window.roamjs.extension.smartblocks.registerCommand(args)
            );
        }

        async function fetchHN(CP) {
            if (!extensionAPI.settings.get("hn-header")) {
                HNHeader = "Hacker News top stories:";
            } else {
                HNHeader = extensionAPI.settings.get("hn-header");
            }

            var url = "https://hacker-news.firebaseio.com/v0/topstories.json";

            return fetch(url).then(r => r.json()).then((ids) => {
                var hnIds = ids.slice(0, 5);
                return hnIds;
            }).then((hnIds) => {
                return (async () => {
                    const regex = /[\[\(]{1}.+[\]\)]{1}/;
                    const getArticle1 = new Promise((resolve, reject) => {
                        url = "https://hacker-news.firebaseio.com/v0/item/" + hnIds[0] + ".json";
                        fetch(url).then(r => r.json()).then((result) => {
                            var title = result.title.replace(regex, '');
                            var url = result.url;
                            var results = { title, url };
                            resolve(results);
                        })
                    });

                    const getArticle2 = new Promise((resolve, reject) => {
                        url = "https://hacker-news.firebaseio.com/v0/item/" + hnIds[1] + ".json";
                        fetch(url).then(r => r.json()).then((result) => {
                            var title = result.title.replace(regex, '');
                            var url = result.url;
                            var results = { title, url };
                            resolve(results);
                        })
                    });

                    const getArticle3 = new Promise((resolve, reject) => {
                        url = "https://hacker-news.firebaseio.com/v0/item/" + hnIds[2] + ".json";
                        fetch(url).then(r => r.json()).then((result) => {
                            var title = result.title.replace(regex, '');
                            var url = result.url;
                            var results = { title, url };
                            resolve(results);
                        })
                    });

                    const getArticle4 = new Promise((resolve, reject) => {
                        url = "https://hacker-news.firebaseio.com/v0/item/" + hnIds[3] + ".json";
                        fetch(url).then(r => r.json()).then((result) => {
                            var title = result.title.replace(regex, '');
                            var url = result.url;
                            var results = { title, url };
                            resolve(results);
                        })
                    });

                    const getArticle5 = new Promise((resolve, reject) => {
                        url = "https://hacker-news.firebaseio.com/v0/item/" + hnIds[4] + ".json";
                        fetch(url).then(r => r.json()).then((result) => {
                            var title = result.title.replace(regex, '');
                            var url = result.url;
                            var results = { title, url };
                            resolve(results);
                        })
                    });

                    return Promise.allSettled([getArticle1, getArticle2, getArticle3, getArticle4, getArticle5])
                        .then(async results => {
                            var output = [
                                { text: "[" + results[0].value.title + "](" + results[0].value.url + ")" },
                                { text: "[" + results[1].value.title + "](" + results[1].value.url + ")" },
                                { text: "[" + results[2].value.title + "](" + results[2].value.url + ")" },
                                { text: "[" + results[3].value.title + "](" + results[3].value.url + ")" },
                                { text: "[" + results[4].value.title + "](" + results[4].value.url + ")" },
                            ]
                            if (CP == undefined) {
                                let SBoutput = [];
                                SBoutput.push({ "text": HNHeader, "children": output });
                                return SBoutput;
                            } else {
                                return output;
                            }
                        })
                })();
            })
        };
    },
    onunload: () => {
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("HACKERNEWS");
        }
    }
}