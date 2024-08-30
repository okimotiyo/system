import React from 'react';
import moment from "moment";
import "./calendar.css"
import { Button } from 'antd';
import { PlusOutlined, NotificationTwoTone, UserOutlined } from '@ant-design/icons';

const CustomToolbar = (toolbar) => {

  const label = () => {
    const date = moment(toolbar.date);
    return (
      <span>
        {date.format('YYYY/MM/DD')}
      </span>
    );
  };

  const openM = () => {
    toolbar.openModal({ number: "1" });
  }

  const goToNextMonth = () => {
    const nextMonth = moment(toolbar.date).add(1, 'month').toDate();
    toolbar.onNavigate('next', nextMonth);
  };

  const goToPrevMonth = () => {
    const prevMonth = moment(toolbar.date).subtract(1, 'month').toDate();
    toolbar.onNavigate('prev', prevMonth);
  };

  const goToNextDay = () => {
    const nextDay = moment(toolbar.date).add(1, 'day').toDate();
    toolbar.onNavigate('next', nextDay);
  };

  const goToPrevDay = () => {
    const prevDay = moment(toolbar.date).subtract(1, 'day').toDate();
    toolbar.onNavigate('prev', prevDay);
  };

  return (
    <div className="rbc-toolbar" style={{ padding: '0 20px' }}>
      <span>
        <span className="rbc-toolbar-label">{label()}</span>
        <span className="rbc-btn-group">
          <button type="button" onClick={() => toolbar.onView('month')}>月</button>
          <button type="button" onClick={() => toolbar.onView('day')}>日</button>
        </span>
      </span>

      <span>
        <Button type="button" onClick={goToPrevMonth} style={{ marginRight: '10px' }}>前の月</Button>
        <Button type="button" onClick={goToPrevDay} style={{ marginRight: '10px' }}>前の日</Button>
        <Button type="button" onClick={goToNextDay} style={{ marginRight: '10px' }}>次の日</Button>
        <Button type="button" onClick={goToNextMonth} style={{ marginRight: '10px' }}>次の月</Button>
      </span>

      <span>

        <Button style={{ backgroundColor: '#fff476', border: 'none' }}><NotificationTwoTone /><span style={{ marginLeft: '5px' }}>通知リスト</span></Button>
        <Button style={{ marginLeft: '10px', backgroundColor: '#d9d9d9', border: 'none' }} icon={<PlusOutlined />} onClick={openM}><span style={{ marginLeft: '5px' }}>新規予約</span></Button>
        <span style={{ marginLeft: '20px' }}><UserOutlined /><span style={{ marginLeft: '5px' }}>倉庫1</span></span>
      </span>
    </div>
  );
};

export default CustomToolbar;
