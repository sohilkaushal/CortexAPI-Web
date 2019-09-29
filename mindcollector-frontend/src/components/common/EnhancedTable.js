import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TablePagination, Checkbox, IconButton, makeStyles, Toolbar, Button, Grid, Switch, TableFooter } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles'
import FirstPageIcon from '@material-ui/icons/FirstPage'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import LastPageIcon from '@material-ui/icons/LastPage'
const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
}));
/**
 * Props to send are as follows
 * @data : type<Object> : Accepts data for the table to display
 * @options : type<Object> : options for the Table
 *     @disablePagination : type<Boolean> : disable pagination and adds scroll.
 *     @disablePaginationDefaults : type<Boolean> : disable the deafault function for pagination buttons
 *     @onFirstButtonClick @onBackButtonClick @onNextButtonClick @onLastButtonClick  : type<Function> : extention function PaginationsButtons
 *     @ignoreKeys : type<Array> : send the keys you want to ignore
 *     @actions : type<Array of objects> : array to set actions per row basis
 *         @name : type<String> : name of the action to be displayed in Table header
 *         @label :  type<String> : label for the action button
 *         @type : type<String> : switch or button
 *         @defaultValueFrom : type<String> : key name from the object to set defaultValue of switch
 *         @function : type<function> : function to be performed by switch(onChange) and button(onClick) : params (event,rowData)
 *    @toolbarActions :  type<Array of objects> : array to set actions on selected items
 *         @label : type<string> : Button Label
 *         @function : type<function> : function to be performed by toolbar button(onClick) : params (event,selectedItemData)
 *@styles : type<Object> : Accepts StyleInfo about the Table styles are following: 
 *    @table 
 *    @tableCell
 *    @heading
 *    @toolbar
 *    @paper
 *    @tableRow
 *    @tableHead
 *    @tableBody
 *    @tableFooter
 *    @tablePagination
 * 
 * 
 *  Example Code : <EnhancedTable data={data} options={{
      disablePagination: true,
      selector: true,
      toolbarActions: [{
        label: 'console selected items',
        function: (e, data) => {
         console.log(data);
        }
      }],
      actions: [
          {
            name: 'action switch',
            label: 'console hello world onn swich change',
            type:'switch',
            defaultValueFrom,
            function: (e, data) => {
              console.log("hello world");
            }
          },
          {
            name: 'action button',
            label: 'console hello world on button click',
            type:'button'
            function: (e, data) => {
              console.log(data);
            }
          }
        ],
      ignoreKeys: ['createdAt', 'updatedAt', 'id'],
    }} />
 */

export const EnhancedTable = (props) => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [obj, setObj] = useState([]);
  var selecteditems = [];
  const useStyles1 = makeStyles(theme => ({
    root: {
      flexShrink: 0,
      color: theme.palette.text.secondary,
      marginLeft: theme.spacing(2.5),
    },
  }));
  const handleFirstPageButtonClick = () => {
    if (props.options === undefined)
      return setPage(0);
    if (!props.options.disablePaginationDefaults)
      setPage(0);
    if (typeof props.options.onFirstButtonClick === "function") {
      props.options.onFirstButtonClick();
    }
  };

  const handleBackButtonClick = () => {
    if (props.options === undefined)
      return setPage(page - 1);
    if (!props.options.disablePaginationDefaults)
      setPage(page - 1);
    if (typeof props.options.onBackButtonClick === "function") {
      props.options.onBackButtonClick();
    }
  }

  const handleNextButtonClick = () => {
    if (props.options === undefined)
      return setPage(page + 1);
    if (!props.options.disablePaginationDefaults)
      setPage(page + 1);
    if (typeof props.options.onNextButtonClick === "function") {
      props.options.onNextButtonClick()
    }
  }
  const handleLastPageButtonClick = () => {
    if (props.options === undefined)
      return setPage(Math.max(0, Math.ceil(obj.length / rowsPerPage) - 1));
    if (!props.options.disablePaginationDefaults)
      setPage(Math.max(0, Math.ceil(obj.length / rowsPerPage) - 1));
    if (typeof props.options.onLastButtonClick === "function") {
      props.options.onLastButtonClick()
    }
  }
  const TablePaginationActions = (props) => {
    const classes = useStyles1();
    const theme = useTheme();
    return (
      <div className={classes.root}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil((obj !== undefined ? obj.length : 0) / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil((obj !== undefined ? obj.length : 0) / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    );
  }
  const arrayDiff = (arrayA, arrayB) => {
    var result = [];
    for (var i = 0; i < arrayA.length; i++) {
      if (arrayB.indexOf(arrayA[i]) <= -1) {
        result.push(arrayA[i]);
      }
    }
    return result;
  }
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, (obj !== undefined ? obj.length : 0) - page * rowsPerPage);
  const [rowsPerPageOptions, setRowsPerPageOptions] = useState([]);
  useEffect(() => {
    setObj(props.data)
  }, [props.data])
  const [_keys, setKeys] = useState([]);
  const ignoreKeys = async () => {
    let _keys = await Object.keys(obj[0]);
    if (props.options !== undefined)
      if (props.options.ignoreKeys === undefined) {
        await setKeys(_keys)
      } else await setKeys(arrayDiff(_keys, props.options.ignoreKeys))
    else await setKeys(_keys)
  }
  useEffect(() => {
    var _tempArray = []
    var _counterLimit = Math.floor((obj !== undefined ? obj.length : 0) / rowsPerPage);
    for (var i = 0; i <= _counterLimit; i++) {
      _tempArray.push(rowsPerPage * (i + 1))
    }
    setRowsPerPageOptions(_tempArray)
  }, [obj, rowsPerPage]);
  useEffect(() => {
    if (obj !== undefined)
      if ((obj !== undefined ? obj.length : 0) > 0) {
        ignoreKeys();
      }
  }, [obj])
  const Heading = (props) => {
    return (<TableCell style={props.styles !== undefined ? props.styles.tableCell !== undefined ? props.styles.tableCell : null : null} align={(props.align !== undefined ? props.align : "left")}>{props.value}</TableCell>);
  }
  const renderHeader = () => {
    return _keys.map((key) => {
      return <Heading style={props.styles !== undefined ? props.styles.heading !== undefined ? props.styles.heading : null : null} key={Math.random()} value={key} />;
    })
  }
  const ActionButtonSwitch = (props) => {
    const [check, setCheck] = useState(false);
    useEffect(() => {
      setCheck((props.defaultValue))
    }, [props.defaultValue]);
    return (
      < Switch
        checked={check}
        onChange={(e) => {
          setCheck(!check)
          props.function(e)
        }}
        value={check}
        inputProps={{ 'aria-label': 'secondary checkbox' }
        }
      />
    )
  }
  const ActionButton = (props) => {
    return (
      < Button
        variant={"outlined"}
        onClick={(e) => {
          props.function(e)
        }}
      >
        {props.label !== undefined ? props.label : 'Click Me!'}
      </ Button>
    )
  }
  const breakObject = (obj) => {
    let _keys = Object.keys(obj);
    return _keys.map((value, i) => {
      //TODO : to be fixed disbabled for now
      if (typeof obj[value] === 'object' || false) {
        console.log('hello');
        return breakObject(value);
      } else
        return (
          <span key={Math.random()}><strong>{value}</strong>: {obj[value]}{_keys.length > i ? <br /> : null}</span>
        );
    });
  };
  const RenderRow = (props) => {
    return props.keys.map((key) => {
      return (<TableCell style={props.styles !== undefined ? props.styles.tableCell !== undefined ? props.styles.tableCell : null : null} key={Math.random()}>
        <Typography varient="body1">
          {typeof props.data[key] === 'object' ? breakObject(props.data[key]) : String(props.data[key])}
        </Typography>
      </TableCell>)
    });
  };

  const toggleSelectedItem = async (item, value) => {
    let _selectedItems = selecteditems;
    if (value) {
      let _tempArray = await _selectedItems.filter(value => value !== item);
      selecteditems = await _tempArray;
    } else {
      await _selectedItems.push(item);
      selecteditems = await _selectedItems;
    }
  }

  const Selector = (props) => {
    const [initData, setInitData] = useState(false);
    return (
      <div>
        <Checkbox
          checked={Boolean(initData)}
          color="secondary"
          onChange={
            (e) => {
              toggleSelectedItem(props.selectedObject, initData)
              setInitData(!initData)
            }
          }
        />
      </div>
    )
  }


  const renderActions = (__obj) => {
    let defaultValue;
    if (props.options.actions !== undefined) {
      return props.options.actions.map(value => {
        defaultValue = value.defaultValueFrom !== undefined ? __obj[value.defaultValueFrom] : false;
        return (<TableCell style={props.styles !== undefined ? props.styles.tableCell !== undefined ? props.styles.tableCell : null : null} key={Math.random()}>
          {value.type === "switch" ?
            < ActionButtonSwitch key={Math.random()} defaultValue={defaultValue} function={(e) => { value.function(e, __obj) }} /> :
            <ActionButton key={Math.random()} label={value.label} function={(e) => { value.function(e, __obj) }} />
          }
        </TableCell>
        )
      })
    }
  };
  const getRowsData = (data) => {
    if (props.options !== undefined)
      if (props.options.disablePagination)
        return data.map((row, index) => {
          return (
            <TableRow key={Math.random()}>
              {(props.options !== undefined ? props.options.selector ? (props.options.toolbarActions !== undefined ? <TableCell style={props.styles !== undefined ? props.styles.tableCell !== undefined ? props.styles.tableCell : null : null} key={index + "select"}><Selector
                selectedObject={obj[index]}
              /></TableCell> : null) : null : null)}
              {(props.options !== undefined ? props.options.actionLocation === "start" ? (props.options.actions !== undefined ? renderActions(obj[index]) : null) : null : null)}
              <RenderRow key={Math.random()} page={page} data={row} keys={_keys} />
              {(props.options !== undefined ? props.options.actionLocation !== "start" ? (props.options.actions !== undefined ? renderActions(obj[index]) : null) : null : null)}
            </TableRow>);
        })
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
      return (
        <TableRow key={Math.random()}>
          {(props.options !== undefined ? props.options.selector ? (props.options.toolbarActions !== undefined ? <TableCell style={props.styles !== undefined ? props.styles.tableCell !== undefined ? props.styles.tableCell : null : null} key={index + "select"}><Selector
            selectedObject={obj[index]}
          /></TableCell> : null) : null : null)}
          {(props.options !== undefined ? props.options.actionLocation === 'start' ? (props.options.actions !== undefined ? renderActions(obj[index]) : null) : null : null)}
          <RenderRow key={Math.random()} page={page} data={row} keys={_keys} />
          {(props.options !== undefined ? props.options.actionLocation !== 'start' ? (props.options.actions !== undefined ? renderActions(obj[index]) : null) : null : null)}
        </TableRow>);
    })
  }

  const renderActionHeaders = () => {
    return props.options.actions.map(value => {
      return <Heading style={props.styles !== undefined ? props.styles.heading !== undefined ? props.styles.heading : null : null} key={Math.random()} value={value.name} />;
    });
  }

  const renderEmptyRows = () => {
    if (emptyRows > 0)
      return (< TableRow style={{ height: 48 * emptyRows }} >
        <TableCell style={props.styles !== undefined ? props.styles.tableCell !== undefined ? props.styles.tableCell : null : null} colSpan={_keys.length} />
      </TableRow >);
    else return null;
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  const createBar = () => {
    if (props.options !== undefined)
      return (
        <Toolbar style={props.styles !== undefined ? props.styles.toolbar !== undefined ? props.styles.toolbar : null : null}>
          <Grid container alignContent="flex-end" alignItems="flex-end">
            {props.options.toolbarActions !== undefined ?
              props.options.toolbarActions.map(value => {
                return (<Grid item key={Math.random()}>
                  <Button color="primary" size="small" onClick={(e) => { value.function(e, selecteditems) }} variant="contained">{value.label}</Button>
                </Grid>)
              })
              : ''
            }
          </Grid>
        </Toolbar>);
    return null;
  }

  let content = (
    <Paper className={classes.root} style={props.styles !== undefined ? props.styles.paper !== undefined ? props.styles.paper : null : null}>
      {createBar()}
      <Table className={classes.table} style={props.styles !== undefined ? props.styles.table !== undefined ? props.styles.table : null : null}>
        <TableHead style={props.styles !== undefined ? props.styles.tableHead !== undefined ? props.styles.tableHead : null : null}>
          <TableRow style={props.styles !== undefined ? props.styles.tableRow !== undefined ? props.styles.tableRow : null : null}>
            {(props.options !== undefined ? props.options.selector ? (props.options.toolbarActions !== undefined ? <Heading key={Math.random()} value={'selection'} style={props.styles !== undefined ? props.styles.heading !== undefined ? props.styles.heading : null : null} /> : null) : null : null)}
            {(props.options !== undefined ? props.options.actionLocation === 'start' ? (props.options.actions !== undefined ? renderActionHeaders() : null) : null : null)}
            {renderHeader()}
            {(props.options !== undefined ? props.options.actionLocation !== 'start' ? (props.options.actions !== undefined ? renderActionHeaders() : null) : null : null)}
          </TableRow>
        </TableHead>
        <TableBody style={props.styles !== undefined ? props.styles.tableBody !== undefined ? props.styles.tableBody : null : null}>
          {(obj !== undefined ? getRowsData(obj) : null)}
          {renderEmptyRows()}
        </TableBody>
        {props.options !== undefined ? props.options.disablePagination ? null : < TableFooter style={props.styles !== undefined ? props.styles.tableFooter !== undefined ? props.styles.tableFooter : null : null}>
          <TableRow style={props.styles !== undefined ? props.styles.tableRow !== undefined ? props.styles.tableRow : null : null}>
            <TablePagination
              style={props.styles !== undefined ? props.styles.tablePagination !== undefined ? props.styles.tablePagination : null : null}
              rowsPerPageOptions={rowsPerPageOptions}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              onChangePage={() => { }}
              count={(obj !== undefined ? obj.length : 0)}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true
              }}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter> :
          < TableFooter style={props.styles !== undefined ? props.styles.tableFooter !== undefined ? props.styles.tableFooter : null : null}>
            <TableRow>
              <TablePagination
                style={props.styles !== undefined ? props.styles.tablePagination !== undefined ? props.styles.tablePagination : null : null}
                rowsPerPageOptions={rowsPerPageOptions}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                onChangePage={() => { }}
                count={(obj !== undefined ? obj.length : 0)}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true
                }}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>}
      </Table>
    </Paper>
  );
  return content;
};
