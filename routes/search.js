module.exports = {
  // 搜索
  //#region 
  // '/': async ({req, res, request, cache}) => {
  //   let {
  //     pageNo = 1,
  //     pageSize = 20,
  //     key,
  //     t = 0, // 0：单曲，2：歌单，7：歌词，8：专辑，9：歌手，12：mv
  //     raw,
  //   } = req.query;
  //   let total = 0;

  //   if (!key) {
  //     return res.send({
  //       result: 500,
  //       errMsg: '关键词不能为空',
  //     });
  //   }

  //   const cacheKey = `search_${key}_${pageNo}_${pageSize}_${t}`;
  //   const cacheData = cache.get(cacheKey);
  //   if (cacheData) {
  //     res && res.send(cacheData);
  //     return cacheData;
  //   }
  //   const url =
  //     {
  //       // https://u.y.qq.com/cgi-bin/musicu.fcg
  //       // 0: 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp',
  //       2: `https://c.y.qq.com/soso/fcgi-bin/client_music_search_songlist?remoteplace=txt.yqq.playlist&page_no=${
  //         pageNo - 1
  //       }&num_per_page=${pageSize}&query=${key}`,
  //       // 3: 'http://c.y.qq.com/soso/fcgi-bin/client_search_user',
  //     }[t] || 'http://c.y.qq.com/soso/fcgi-bin/client_search_cp';

  //   const typeMap = {
  //     0: 'song',
  //     2: 'songlist',
  //     7: 'lyric',
  //     8: 'album',
  //     12: 'mv',
  //     9: 'singer',
  //   };

  //   if (!typeMap[t]) {
  //     return res.send({
  //       result: 500,
  //       errMsg: '搜索类型错误，检查一下参数 t',
  //     });
  //   }

  //   let data = {
  //     format: 'json', // 返回json格式
  //     n: pageSize, // 一页显示多少条信息
  //     p: pageNo, // 第几页
  //     w: key, // 搜索关键词
  //     cr: 1, // 不知道这个参数什么意思，但是加上这个参数你会对搜索结果更满意的
  //     g_tk: 5381,
  //     t,
  //   };

  //   if (Number(t) === 2) {
  //     data = {
  //       query: key,
  //       page_no: pageNo - 1,
  //       num_per_page: pageSize,
  //     };
  //   }

  //   const result = await request({
  //     url,
  //     method: 'get',
  //     data,
  //     headers: {
  //       Referer: 'https://y.qq.com',
  //     },
  //   });

  //   if (Number(raw)) {
  //     return res.send(result);
  //   }

  //   // 下面是数据格式的美化
  //   const {keyword} = result.data;
  //   const keyMap = {
  //     0: 'song',
  //     2: '',
  //     7: 'lyric',
  //     8: 'album',
  //     12: 'mv',
  //     9: 'singer',
  //   };
  //   const searchResult =
  //     (keyMap[t] ? result.data[keyMap[t]] : result.data) || [];
  //   const {
  //     list,
  //     curpage,
  //     curnum,
  //     totalnum,
  //     page_no,
  //     num_per_page,
  //     display_num,
  //   } = searchResult;

  //   switch (Number(t)) {
  //     case 2:
  //       pageNo = page_no + 1;
  //       pageSize = num_per_page;
  //       total = display_num;
  //       break;
  //     default:
  //       pageNo = curpage;
  //       pageSize = curnum;
  //       total = totalnum;
  //       break;
  //   }

  //   const resData = {
  //     result: 100,
  //     data: {
  //       list,
  //       pageNo,
  //       pageSize,
  //       total,
  //       key: keyword || key,
  //       t,
  //       type: typeMap[t],
  //     },
  //     // header: req.header(),
  //     // req: JSON.parse(JSON.stringify(req)),
  //   };
  //   cache.set(cacheKey, resData, 120);
  //   res.send && res.send(resData);
  //   return resData;
  // },
//#endregion
 "/": async ({ req, res, request, cache }) => {
    let {
      pageNo = 1,
      pageSize = 20,
      key,
      t = 0, // 0：单曲，2：歌单，7：歌词，8：专辑，9：歌手，12：mv
      raw,
    } = req.query;
    let total = 0;

    if (!key) {
      return res.send({
        result: 500,
        errMsg: "关键词不能为空",
      });
    }

    const cacheKey = `search_${key}_${pageNo}_${pageSize}_${t}`;
    const cacheData = cache.get(cacheKey);
    if (cacheData) {
      res && res.send(cacheData);
      return cacheData;
    }
    const url = "https://u.y.qq.com/cgi-bin/musicu.fcg";
    // 0：单曲
    // 1：歌手
    // 2：专辑
    // 3：歌单
    // 4：mv
    // 7：歌词
    // 8：用户

    let data = {
      "music.search.SearchCgiService": {
        method: "DoSearchForQQMusicDesktop",
        module: "music.search.SearchCgiService",
        param: {
          num_per_page: pageSize,
          page_num: pageNo,
          query: key,
          search_type: t,
        },
      },
    };

    const result = await request({
      url,
      method: "post",
      data,
      headers: {
        Referer: "https://y.qq.com",
      },
    });

    if (Number(raw)) {
      return res.send(result);
    }
    console.log("结果", result);

    // 下面是数据格式的美化
    const { keyword, sum, perpage, curpage } =
      result["music.search.SearchCgiService"].data.meta;

    const searchResult =
      result["music.search.SearchCgiService"].data.body.song.list || [];
    //   (keyMap[t] ? result.data[keyMap[t]] : result.data) || [];
    const list = searchResult.map((item) => ({
      singer: item.singer, // 、
      name: item.title,
      songid: item.id,
      songmid: item.mid,
      songname: item.title,

      albumid: item.album.id,
      albummid: item.album.mid,
      albumname: item.album.name,
      interval: item.interval,

      strMediaMid: item.file.media_mid,
      size128: item.file.size_128mp3,
      size320: item.file.size_320mp3,
      sizeape: item.file.size_ape,
      sizeflac: item.file.size_flac,
    }));

    pageNo = curpage;
    pageSize = perpage;
    total = sum;

    const resData = {
      result: 100,
      data: {
        list,
        pageNo,
        pageSize,
        total,
        key: keyword || key,
        t,
      },
      // header: req.header(),
      // req: JSON.parse(JSON.stringify(req)),
    };
    cache.set(cacheKey, resData, 120);
    res.send && res.send(resData);
    return resData;
  },
  // fixme: 腾讯修改 已经无法继续使用
  // // 热搜词
  // '/hot': async ({req, res, request}) => {
  //   const {raw} = req.query;
  //   const result = await request({
  //     url: 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg',
  //   });
  //   if (Number(raw)) {
  //     return res.send(result);
  //   }
  //   res.send({
  //     result: 100,
  //     data: result.data.hotkey,
  //   });
  // },

  // // 快速搜索
  // '/quick': async ({req, res, request}) => {
  //   const {raw, key} = req.query;
  //   if (!key) {
  //     return res.send({
  //       result: 500,
  //       errMsg: 'key ?',
  //     });
  //   }
  //   const result = await request(
  //     `https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg?key=${key}&g_tk=5381`,
  //   );
  //   if (Number(raw)) {
  //     return res.send(result);
  //   }
  //   return res.send({
  //     result: 100,
  //     data: result.data,
  //   });
  // },
};
