export const trackEvent = (obj, type) => {
  if (type === 'btn_click') {
    let params = {
      is_subapp: "true", // 非必传，默认为false,是否未子应用
      subapp_name: "工作台_实时开发", // 非必传
      id: "button_click", // 必传
      async: true,
      target: '', // 非必传 ?事件源信息
      page_id: "/HTAI/v2/#/sloth/develop", // 用户上报
      page_title: "工作台_空间详情_实时数据开发项目", // 用户上报
      btn_id: "button_click", // 用户上报
      btn_title: "",
      show_log: true // 是否在控制台打印数据
    };
    Object.assign(params, obj);
    (window as any).htaiTrack.event_report(params);
  } else if (type === 'tab_click'){
    let params = {
      is_subapp: "true", // 非必传，默认为false,是否未子应用
      subapp_name: "工作台_实时开发", // 非必传
      id: "tab_click", // 必传
      async: true,
      target: '', // 非必传 ?事件源信息
      page_id: "/HTAI/v2/#/sloth/develop", // 用户上报
      page_title: "工作台_空间详情_实时数据开发项目", // 用户上报
      btn_id: "tab_click", // 用户上报
      btn_title: "",
      show_log: false // 是否在控制台打印数据
    };
    Object.assign(params, obj);
    (window as any).htaiTrack.event_report(params);
  } else if (type === 'page_view'){
    let params = {
      is_subapp: "true", // 非必传，默认为false,是否未子应用
      subapp_name: "工作台_实时开发", // 非必传
      id: "page_view", // 必传
      async: true,
      target: '', // 非必传 ?事件源信息
      page_id: "/HTAI/v2/#/sloth/develop", // 用户上报
      page_title: "工作台_空间详情_实时数据开发项目", // 用户上报
      show_log: false // 是否在控制台打印数据
    };
    Object.assign(params, obj);
    (window as any).htaiTrack.event_report(params);
  }
};
