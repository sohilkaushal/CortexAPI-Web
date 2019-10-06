import React, { createContext, useState, useEffect } from 'react';
import { LayoutConfig } from 'configurations';
export const LayoutContext = createContext();

export const LayoutProvider = (props) => {
  const { children } = props;
  const [pageTitle, setPageTitle] = useState('');
  const [headerElements, setHeaderElements] = useState(null);
  let _pathtoCheck = String(window.location.pathname).split('/');
  useEffect(() => {
    let _controllerArr;
    LayoutConfig.menuItems.forEach(value => {
      _controllerArr = String(value.controller).split('/');
      if (_pathtoCheck[1] === _controllerArr[1]) {
        setPageTitle((value.customTitle === undefined || value.customTitle === '' ? value.name : value.customTitle));
      }
    });
    if (_pathtoCheck[1] === 'menu') {
      setPageTitle('Menu');
    }
  }, [_pathtoCheck]);
  return <LayoutContext.Provider value={{ pageTitle, setPageTitle, headerElements, setHeaderElements }} >{children}</LayoutContext.Provider>
}
