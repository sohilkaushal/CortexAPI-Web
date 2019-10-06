import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import API from 'helpers/api';
import React from 'react';

const useStyles = makeStyles(theme => ({
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function CaptureDropDown(params) {
  const classes = useStyles();
  const [captureId, setCaptureId] = React.useState('');
  const { setDataCallback } = params;
  const [captureIds, setCaptureIds] = React.useState([]);

  React.useEffect(() => {
    API.getCaptureIds((response) => {
      setCaptureIds(response.data.map((capture) => capture.name));
    });
  }, []);

  const handleChange = (event) => {
    setCaptureId(event.target.value);
    if (event.target.value) {
      API.getCapture(event.target.value, true, setDataCallback);
    } else {
      setDataCallback();
    }
  }

  return (
    <form autoComplete="off">
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="capture-ids-open-select"> Capture</InputLabel>
        <Select
          value={captureId}
          onChange={handleChange}
          inputProps={{
            name: 'captureId',
            id: 'capture-ids-open-select',
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {
            captureIds.map((captureId, index) => (
              <MenuItem key={index} value={captureId}>{captureId}</MenuItem>
            ))
          }
        </Select>
      </FormControl>
    </form>
  );
}