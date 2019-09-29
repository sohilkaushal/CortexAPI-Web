import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { mainListItems, secondaryListItems } from './listItems';
import Chart from './Chart';
import PieChart from './RadialBar';
import CurrentState from './CurrentState';
import Deposits from './Deposits';
import Intensity from './Intensity';
import Orders from './Orders';
import DropDown from './DropDown';


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
    display: 'flex',
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
  fixedHeight: {
    //height: 240,
  },
  paperJustifyRight: {
    justify: 'flex-end',
  }
}));

export default function Dashboard() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <div className={classes.root}>
      {/* <CssBaseline /> */}

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        <Container maxWidth="lg" className={classes.container}>
          <DropDown />
          <Grid container spacing={3}>
            <Grid item xs={6} md={8} lg={6}>
              <Paper className={fixedHeightPaper}>
                <Chart />
                <Chart />
                <Chart />
                <Chart />
                <Chart />
              </Paper>
            </Grid>
           

            <Grid item xs={6} md={8} lg={6}>
              <Paper className={fixedHeightPaper}>
                <PieChart />
              </Paper>    
            </Grid>


            <Grid item xs={6} md={8} lg={6}>
              <Paper className={fixedHeightPaper}>
              <CurrentState />

              </Paper>
            </Grid>
            <Grid item xs={6} md={8} lg={6}>
              <Paper className={fixedHeightPaper}>

                <Intensity />
              </Paper>
            </Grid>
            
           

          </Grid>
        </Container>

        <Copyright />
      </main>
    </div>
  );
}
