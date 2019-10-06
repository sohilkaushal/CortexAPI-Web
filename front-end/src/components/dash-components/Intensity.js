import React, { PureComponent } from 'react';
import { Pie, PieChart, Legend } from 'recharts';

const COLORS = ['#0088FE', '#ffffff', '#FFBB28', '#FF8042'];

export default class IntensityChart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { chartData: [] };
  }

  componentDidMount = () => {
    this.setState({
      chartData: this.props.chartData,
    });
  }

  componentDidUpdate = (prevProps, prevState, snapshot) => {
    if (this.props.chartData === prevProps.chartData) {
      return;
    }
    const state = {
      ...prevState,
      chartData: this.props.chartData,
    };

    this.setState(state);
  }

  render() {
    return (
      <React.Fragment>
      <PieChart width={300} height={300}>
        <Pie
          data={this.state.chartData}
          cx={150}
          cy={140}
          innerRadius="50%"
          outerRadius="75%"
          fill="#8884d8"
          paddingAngle={0}
          dataKey="bandpower"
          nameKey="name"
          label={false}
        >
        </Pie>
        <Legend />
      </PieChart>
  
      </React.Fragment>

    );
  }
}
