import React, { PureComponent } from 'react';
import Typography from '@material-ui/core/Typography';
import Title from './Title';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const series = [
  {
    name: 'Series 1',
    data: [
      { category: 'A', value: Math.random() },
      { category: 'B', value: Math.random() },
      { category: 'C', value: Math.random() },
    ],
  },
  {
    name: 'Series 2',
    data: [
      { category: 'B', value: Math.random() },
      { category: 'C', value: Math.random() },
      { category: 'D', value: Math.random() },
    ],
  },
  {
    name: 'Series 3',
    data: [
      { category: 'C', value: Math.random() },
      { category: 'D', value: Math.random() },
      { category: 'E', value: Math.random() },
    ],
  },
];

export default class Example extends PureComponent {
  static jsfiddleUrl = 'https://jsfiddle.net/alidingling/ewcqxbwo/';

  
  render() {
    return (
      
      <React.Fragment>
      <Title>Raw EEG Data</Title>
      
      <Typography component="p" variant="h4">
        <div className> </div>
      </Typography>
      
      <LineChart width={500} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" type="category" allowDuplicatedCategory={false} />
        <YAxis dataKey="value" />
        <Tooltip />
        <Legend />
        {series.map(s => (
          <Line dataKey="value" data={s.data} name={s.name} key={s.name} />
        ))}
      </LineChart>
    </React.Fragment>

    );
  }
}

