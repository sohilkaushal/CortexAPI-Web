import React, { PureComponent } from 'react';
import { Legend, RadialBar, RadialBarChart } from 'recharts';

const style = {
  top: 0,
  left: 350,
  lineHeight: '54px',
};

export default class BandpowerRadialBarChart extends PureComponent {
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
        <RadialBarChart width={500} height={300} cx={150} cy={150} innerRadius="25%" outerRadius="100%" barSize={32} data={this.state.chartData} startAngle={180} endAngle={-180}>
          <RadialBar background dataKey="bandpower" />
          <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={style} />
        </RadialBarChart>
      </React.Fragment>
    );
  }
}
