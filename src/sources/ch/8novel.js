import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';

const sourceId = 166;
const sourceName = '8novel';

const baseUrl = 'https://www.8novel.com';

const popularNovels = async page => {
  const url = `${baseUrl}/booklists/rank/`;
  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const novels = [];

  // Thanks Bootstrap D:
  loadedCheerio(
    '.row.p-1.mx-1 > .col-sm-12:nth-child(2) .rank_div .w-100',
  ).each(function () {
    let novelUrl = loadedCheerio(this).find('a').attr('href');

    if (novelUrl) {
      const novelName = loadedCheerio(this).find('li.nowraphide').text();
      // Only top 3 has image
      const novelCover =
        loadedCheerio(this).find('img.cover5rem').attr('src') ?? null;
      novelUrl = baseUrl + novelUrl;

      const novel = {
        sourceId,
        novelUrl,
        novelName,
        novelCover,
      };

      novels.push(novel);
    }
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;
  const body = await fetchHtml({ url, sourceId });
  const loadedCheerio = cheerio.load(body);

  const novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
  };

  novel.name = loadedCheerio('.item_content_box > .h2').text();

  novel.cover = loadedCheerio('.item-cover > img').attr('src');

  novel.summary = loadedCheerio('.full_text').text();

  novel.author = loadedCheerio('.item-info-author').text().substring(4);

  novel.artist = null;

  novel.status = loadedCheerio('.item-info-status').text();

  novel.genres = null;

  // Table of Content is on a different page than the summary page
  let chapters = [];
  let volumeName;

  loadedCheerio('.folder').each(function () {
    volumeName = loadedCheerio('h3.w-100').text();

    /* WIP */

    loadedCheerio(this)
      .find('.episode_li')
      .each(function () {
        const urlPart = chaptersLoadedCheerio(this)
          .find('.chapter-li-a')
          .attr('href');
        const chapterIdMatch = urlPart.match(idPattern);

        // Sometimes the href attribute does not contain the url, but javascript:cid(0).
        // Increment the previous chapter ID should result in the right URL
        if (chapterIdMatch) {
          chapterId = chapterIdMatch[1];
        } else {
          chapterId++;
        }

        const chapterUrl = `${baseUrl}/novel/${novelId}/${chapterId}.html`;

        if (chapterUrl) {
          const chapterName =
            volumeName +
            ' — ' +
            chaptersLoadedCheerio(this).find('.chapter-index').text().trim();
          const releaseDate = null;

          chapters.push({
            chapterName,
            releaseDate,
            chapterUrl,
          });
        }
      });
  });

  novel.chapters = chapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;
  const result = await fetch(url, {
    headers: {
      'User-Agent':
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    },
  });
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  // Remove JS
  loadedCheerio('#acontent .cgo').remove();

  const chapterName =
    loadedCheerio('#atitle + h3').text() +
    ' — ' +
    loadedCheerio('#atitle').text();
  const chapterText = loadedCheerio('#acontent').html();

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}/search.html?searchkey=` + encodeURI(searchTerm);
  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const novels = [];

  const loadSearchResults = function () {
    loadedCheerio('.book-ol .book-layout').each(function () {
      let novelUrl = loadedCheerio(this).attr('href');

      if (novelUrl) {
        const novelName = loadedCheerio(this).find('.book-title').text();
        const novelCover = loadedCheerio(this)
          .find('img.book-cover')
          .attr('data-src');
        novelUrl = baseUrl + novelUrl;

        const novel = {
          url: novelUrl,
          name: novelName,
          cover: novelCover,
        };

        novels.push(novel);
      }
    });
  };

  const novelResults = loadedCheerio('.book-ol .book-layout');

  if (novelResults.length === 0) {
    // console.log('Challenge');
  } else {
    loadSearchResults();
  }

  return novels;
};

const EightnovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default EightnovelScraper;
