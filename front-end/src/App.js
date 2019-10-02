/***
 *  Created by Sanchit Dang
 ***/
import React, { useEffect } from 'react';
import './styles/App.scss';
import './database/idb'
import { CssBaseline } from '@material-ui/core'
import { AppRoutes } from './routes/routes';
import { ContextManager } from 'contexts'
import { Notification, DevModeSwitch } from 'components'
import { DevModeConfig } from 'configurations'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

const globalTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#0074C7',
    },
    secondary: {
      main: '#77D7F2',
    },
  },
});

const App = () => {
  useEffect(() => {
    document.title = 'MindPad Dashboard';
  }, []);
  return (
    <MuiThemeProvider theme={globalTheme}>
      <ContextManager>
        <CssBaseline />
        <AppRoutes />
        {DevModeConfig.visible ? <DevModeSwitch /> : ''}
        <Notification />
      </ContextManager>
    </MuiThemeProvider>
  );
}

export default App;
