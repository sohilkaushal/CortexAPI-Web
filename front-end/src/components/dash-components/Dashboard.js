import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import BandpowerRadialBarChart from './BandpowerRadialBarChart';
import CaptureDropDown from './CaptureDropDown';
import Chart from './Chart';
import { nameToColor } from './helpers/colorHelper';
import Intensity from './Intensity';
import CurrentState from './MentalState';
import Title from './Title';


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        MindPad
      </Link>{' '}
      {new Date().getFullYear()}
    </Typography>
  );
}

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  paperJustifyRight: {
    justify: 'flex-end',
  }
}));

const convertCaptureData = (incomingData) => {
  const convertedData = {};

  // TODO: The slash breaking part of this should live within the mindcollector-backend (i.e. prior to storage).
  //       Cortex's response format is not ideal.
  incomingData.forEach((entry) => {
    const { time } = entry;
    const dataByChannel = {};

    Object.entries(entry.data).forEach(([key, value]) => {
      const [, channel, bandName] = key.match(/^([^/]*)\/(.*)$/);
      const channelData = dataByChannel[channel] = (dataByChannel[channel] || {});

      channelData.time = time;
      channelData[bandName] = value;
    });

    Object.entries(dataByChannel).forEach(([key, value]) => {
      const channelData = convertedData[key] = (convertedData[key] || []);

      channelData.push(value);
    });
  });

  return convertedData;
}

const calculateBandMeans = (incomingData) => {
  const bandMeansResult = {};
  const bandCountsResult = {};
  incomingData.forEach((entry) => {
    Object.entries(entry.data).forEach(([key, value]) => {
      const bandName = key.match(/^[^/]*\/(.*)$/)[1];

      bandMeansResult[bandName] = (bandMeansResult[bandName] || 0) + value;
      bandCountsResult[bandName] = (bandCountsResult[bandName] || 0) + 1;
    });
  });

  return Object.entries(bandMeansResult).map(([key, value]) => {
    return {
      name: key,
      bandpower: value / bandCountsResult[key],
      fill: nameToColor(key),
    };
  }).sort((value1, value2) => {
    const bandpower1 = value1.bandpower;
    const bandpower2 = value2.bandpower;

    if (bandpower1 > bandpower2) {
      return 1;
    }
    if (bandpower2 > bandpower1) {
      return -1;
    }
    return 0;
  });
}

const getMaxVersusOthers = (bandData) => {
  const maxValue = bandData[bandData.length - 1];
  let otherValue = {
    name: 'Others',
    bandpower: 0
  };
  for (var i = 0; i < bandData.length - 1; i += 1) {
    otherValue.bandpower += bandData[i].bandpower;
  }
  return [maxValue, otherValue];
}

export default function Dashboard() {
  const classes = useStyles();
  // Exposed to child components.
  const [bandMeans, setBandMeans] = React.useState([]);
  const [captureData, setCaptureData] = React.useState({});
  const [intensityData, setIntensityData] = React.useState([]);
  const [highestBand, setHighestBand] = React.useState('');
  // const DashboardContext = React.createContext();

  const setDataCallback = (response) => {
    if (!response){
      setCaptureData({});
      setBandMeans([]);
      setIntensityData([]);
      setHighestBand('');
      return;
    }
    const { data } = response.data;

    try {
      const bandMeans =calculateBandMeans(data)
      setCaptureData(convertCaptureData(data));
      setBandMeans(bandMeans);
      setIntensityData(getMaxVersusOthers(bandMeans));
      setHighestBand(bandMeans[bandMeans.length - 1].name);
    } catch (ex) {
      console.error('Failure to convert capture data');
      console.error(ex);
    }
  };

  return (
    <div className={classes.root}>
      <main className={classes.content}>
        {/* <DashboardContext.Provider value={{
          
        }}> */}
        <div className={classes.appBarSpacer} />

        <Container maxWidth="lg" className={classes.container}>
          <CaptureDropDown setDataCallback={setDataCallback} />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CurrentState highestBand={highestBand} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper className={classes.paper}>
                <Title>Brainwave channels</Title>
                {
                  Object.entries(captureData).map(([key, value]) => (
                    <Chart key={key} chartData={value} title={key} />
                  ))
                }
              </Paper>
            </Grid>

            <Grid container item xs={12} md={6} spacing={3} direction="column" >
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Title>Mean bandpower (all channels)</Title>
                  <BandpowerRadialBarChart chartData={bandMeans} />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Title>Intensity</Title>
                  <Intensity chartData={intensityData} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Container>
        {/* </DashboardContext.Provider> */}
        <Copyright />
      </main>
    </div>
  );
}
