import axios from './utils/aaxios.js';
import cheerio from 'cheerio';

async function getQuotes() {
    const resTarget = await axios.get('http://www.brainyquote.com/').catch(resTarget => {
        throw resTarget;
    });

    let targetData = cheerio.load(resTarget.data);
    let categoriesLinks = [];

    let resultJSON = {};
    let dataIndex = 0;

    const baseUrl = 'http://www.brainyquote.com';

    targetData('#allTopics .bqLn').each(function(i, elem) {
        let link = targetData(this).find('div.bqLn a').attr('href');
        categoriesLinks.push(link);
    });

    categoriesLinks.splice(-1, 1) // hack for More Topics button
    categoriesLinks.shift();
    for (let link of categoriesLinks) {
        const currentCategory = link.replace('/quotes/topics/topic_', '').replace('.html', '');
        // This is something I am not proud of :|
        let url = '';
        const dotHtml = '.html';
        link = link.replace('.html', '');
        // End of misery

        // Go through first 9 pages of each category; wrong links redirect to first page
        for (let pageNo = 1; pageNo <= 9; pageNo++) {
            url = baseUrl.concat(link, pageNo, dotHtml);
            console.log(url);
            const resCategory = await axios.get(url).catch(function resCategory(error) {
                if (error.response) {
                    console.log('error: ', error.response);
                    return;
                } else
                    throw resCategory;
            });

            let categoryData = cheerio.load(resCategory.data);

            categoryData('#quotesList .boxyPaddingBig').each(function(i, elem) {
                dataIndex++;
                let quote = {
                    id: dataIndex,
                    quote: categoryData(this).find('span.bqQuoteLink a').text(),
                    author: categoryData(this).find('div.bq-aut a').text(),
                    category: currentCategory
                };
                resultJSON[dataIndex] = quote;
                console.log('[' + dataIndex + ']' + ' Quote:\n', quote);
            });
        }
    }
    console.log(resultJSON);
    return resultJSON;
}

export default getQuotes;
