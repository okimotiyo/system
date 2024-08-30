import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/ja";
import Modal from "react-modal";
import "./calendar.css"
import Toolbar from "./Toolbar.js";
import {
  RocketOutlined, CarOutlined, InfoCircleOutlined, SyncOutlined, CheckCircleOutlined, MinusCircleOutlined, SmileOutlined
} from '@ant-design/icons';
import { Button, Form, Input, Select, Descriptions, Tag, message } from 'antd';
// import db from "./firebase.js";

//firebse
import { db } from '../../api/index.js';
import { addDoc, collection, getDocs, doc, deleteDoc,query, where, } from 'firebase/firestore';


const { Option } = Select;

//カレンダーの時間を日本時間に設定する
moment.locale('ja');

const localizer = momentLocalizer(moment);
Modal.setAppElement('#root');


// バースの配列
const resources = Array.from({ length: 6 }, (_, i) => ({
  resourceId: i + 1,
  resourceTitle: `バース${i + 1}`
}));

//Modalのスタイル
const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 999
  },
  content: {
    top: '40%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    border: '2px solid #ccc',
    width: '50%',
    zIndex: 999
  }
};

const customStyles1 = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  },
  content: {
    top: '40%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    border: '2px solid #ccc',
    width: '50%',
    zIndex: 999
  }
};

const SchedulePage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  //カレンダーの予約内容
  const [events, setEvents] = useState([
    //模擬データ
    {
      id: '0000001',
      end: new Date('2024-07-05T05:00:00+09:00'),
      number: "名古屋xxx あxxx",
      // バース番号
      resourceId: 1,
      start: new Date('2024-07-05T03:00:00+09:00'),
      //1:冷凍　2:常温
      temperature: "1",
      title: "運送会社1",
      //0:予約　1:チャックイン済み　2:チャックアウト済み
      status: '0'
    }
  ]);

  //firebaseデータ
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'reservation'));
      const dataArray = querySnapshot.docs.map(doc => doc.data());
      console.log(dataArray);
      console.log(events);
      // データを変換
      const transformedData = dataArray.map(event => ({
        id: event.id,
        title: event.title,
        number: event.number,
        start: new Date(event.start.seconds * 1000), // FirebaseのtimestampをDateオブジェクトに変換
        end: new Date(event.end.seconds * 1000), // 同上
        resourceId: event.resourceId,
        temperature: event.temperature,
        status: event.status,
        company: event.company,
      }));
      setData(transformedData);
      setEvents(transformedData)
    };
    fetchData();
  }, []);

  useEffect(() => {
    // console.log(data);
  }, [data, events])

  //画面表示される内容をカスタマイズ設定にする
  const EventComponent = ({ event }) => {
    const getStatusLabel = () => {
      switch (event.status) {
        case '0':
          return '予約';
        case '1':
          return 'チェックイン済み';
        case '2':
          return 'チェックアウト済み';
        default:
          return '不明な状態';
      }
    };

    const getStatusIcon = () => {
      switch (event.status) {
        case '0':
          return <SyncOutlined spin />;
        case '1':
          return <CheckCircleOutlined />;
        case '2':
          return <MinusCircleOutlined />;
        default:
          return <InfoCircleOutlined />;
      }
    };

    const getStatusColor = () => {
      switch (event.status) {
        case '0':
          return "processing";
        case '1':
          return "success";
        case '2':
          return "error";
        default:
          return "default";
      }
    };

    const handleDeleteEvent = async () => {
      const reservationRef = collection(db, 'reservation');
      const q = query(reservationRef, where('id', '==', event.id));
      try {
        // Firestoreから該当の予約を削除
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          // ドキュメントを削除
          await deleteDoc(doc.ref);
          console.log('Document successfully deleted!');
        });
        console.log(event.id);
        // メッセージを表示
        messageApi.open({
          type: "success",
          content: (
            <div>
              <span>予約を削除しました</span>
            </div>
          ),
        });
        // イベントリストを更新
        setEvents((prevEvents) =>
          prevEvents.filter((e) => e.id !== event.id)
        );
      } catch (error) {
        console.error("Error deleting event:", error);
        messageApi.open({
          type: "error",
          content: "予約の削除に失敗しました",
        });
      }
    };

    return (
      <span className="eventcomponent">

        <Tag icon={<RocketOutlined />} color="default">
          {event.title}
        </Tag>
        <Button onClick={handleDeleteEvent} danger size="small">
          削除
        </Button>
        <br />
        <Tag icon={<SmileOutlined />} color="default">
          {event.company}
        </Tag>

        <br />
        <Tag icon={<CarOutlined />} color="default">
          {event.number}
        </Tag>
        <br />
        <Tag icon={<InfoCircleOutlined />} color="default">
          状態 :{" "}
          <Tag icon={getStatusIcon()} color={getStatusColor()}>
            {getStatusLabel()}
          </Tag>
        </Tag>
        {/* 削除ボタン */}

      </span>
    );
  };

  const [form] = Form.useForm();

  //追加詳細画面のコントロール初期値設定
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpen1, setModalIsOpen1] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    number: "",
    start: "",
    end: "",
    temperature: "",
    resourceId: 0,
  });

  //確認画面のコントロール初期値設定
  const [modalIsOpen2, setModalIsOpen2] = useState(false);

  // 予約追加画面を開く
  const openModal = (event) => {
    const { start, end, resourceId } = event
    //event.number===1の場合は追加ボタン
    if (event.number !== "1") {
      setNewEvent({ ...newEvent, start, end, resourceId });
      form.setFieldsValue({
        resourceId: resourceId,
        start: moment(start),
        end: moment(end),
      });
    }
    setModalIsOpen(true);
  };

  // 予約追加画面を閉じる
  const closeModal = () => {
    setModalIsOpen(false);
    setNewEvent({
      title: "",
      number: "",
      start: "",
      end: "",
      temperature: "",
      resourceId: 0,
    });
    form.resetFields();
  };
  //確認画面を閉じる
  const closeModal2 = () => {
    setModalIsOpen2(false);
  }

  //入力内容を更新する
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prevEvent => ({
      ...prevEvent,
      [name]: name === "start" || name === "end" ? moment(value, "YYYY-MM-DDTHH:mm").toDate() : value,
    }));

  };

  //予約された区域
  const setContain = (e) => {
    setModalIsOpen2(true);
    setNewEvent(e)
  }


  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  // 予約提出ボタンをクリック
  const onFinish = async (values) => {
    const currentLength = events.length + 1;
    const id = String(currentLength).padStart(7, '0');
    values.start = newEvent.start;
    values.end = newEvent.end;
    values.resourceId = Number(values.resourceId);
    values.id = id;
    values.status = '0';
    console.log(values);
    //後でデータベースに保存する
    // Firebaseにデータを追加
    try {
      await addDoc(collection(db, 'reservation'), values);
      messageApi.open({
        type: 'success',
        content: React.createElement(
          'div',
          null,
          React.createElement('span', null, '予約完了しました'),
          React.createElement('br'),
          React.createElement('span', null, `予約番号:${id}`)
        ),
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      messageApi.open({
        type: 'error',
        content: '予約の追加に失敗しました',
      });
    }

    setEvents(prevEvents => [
      ...prevEvents,
      values,
    ]);
    closeModal();
  };

  // 詳細画面内容
  const items = [
    {
      key: '1',
      label: '予約番号',
      children: newEvent.id,
      span: 1.5,
    },
    {
      key: '2',
      label: 'バース',
      children: newEvent.resourceId,
      span: 1.5,
    },
    {
      key: '3',
      label: '運送会社',
      children: newEvent.title,
      span: 3,
    },
    {
      key: '4',
      label: '到着日時',
      children: moment(newEvent.start).format("YYYY-MM-DD HH:mm"),
      span: 1.5,
    },
    {
      key: '5',
      label: '出発日時',
      children: moment(newEvent.end).format("YYYY-MM-DD HH:mm"),
      span: 1.5,
    },
    {
      key: '6',
      label: '荷主',
      children: newEvent.company,
      span: 3,
    },
    {
      key: '7',
      label: '温度',
      children: newEvent.temperature === 1 ? '冷凍' : '常温',
      span: 3,
    },
  ];

  //チェックイン機能
  const checkIn = () => {
    //後でデータベースに保存する
    events.forEach(event => {
      if (event.id === newEvent.id) {
        event.status = "1";
        messageApi.open({
          type: 'success',
          content: React.createElement(
            'div',
            null,
            React.createElement('span', null, 'チェックインしました'),
            React.createElement('br'),
            React.createElement('span', null, `予約番号:${event.id}`)
          ),
        });
      }
      setModalIsOpen2(false);
    })
  }

  //チェックアウト機能
  const checkOut = () => {
    //後でデータベースに保存する
    events.forEach(event => {
      if (event.id === newEvent.id) {
        event.status = "2";
        messageApi.open({
          type: 'success',
          content: React.createElement(
            'div',
            null,
            React.createElement('span', null, 'チェックアウトしました'),
            React.createElement('br'),
            React.createElement('span', null, `予約番号:${event.id}`)
          ),
        });
      }
    })
    setModalIsOpen2(false);
  }

  //予約変更
  const checkChange = () => {
    setModalIsOpen1(true);
    form.setFieldsValue({
      title: newEvent.title,
      company: newEvent.company,
      number: newEvent.number,
      start: moment(newEvent.start),
      end: moment(newEvent.end),
      temperature: newEvent.temperature,
      resourceId: newEvent.resourceId,
    })
  }

  const closeModal1 = () => {
    setModalIsOpen1(false);
  };

  const onFinishFailed1 = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  // 予約変更確認ボタンをクリック
  const onFinish1 = (values) => {
    values.resourceId = Number(values.resourceId);
    let newArr = { ...newEvent, ...values }
    //後でデータベースに保存する
    const updatedEvents = events.map((i) =>
      i.id === newArr.id ? newArr : i
    );
    setEvents(updatedEvents);
    closeModal1();
    messageApi.open({
      type: 'success',
      content: React.createElement(
        'div',
        null,
        React.createElement('span', null, '変更完了しました'),
        React.createElement('br'),
        React.createElement('span', null, `変更番号:${newEvent.id}`)
      ),
    });
  };

  return (
    <div className="App">
      {contextHolder}
      <Calendar
        selectable
        onSelectSlot={openModal}
        onSelectEvent={setContain}
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="day"
        events={events}
        resources={resources}
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        style={{ height: "100vh" }}
        components={{
          event: EventComponent,
          toolbar: (props) => <Toolbar {...props} openModal={openModal} />,
        }}
      />
      {/* 追加画面 */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="追加"
        style={customStyles}
      >
        <h3>予約追加</h3>

        <Form
          name="appointment"
          form={form}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
            zIndex: 1000
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="運送会社"
            name="title"
            rules={[
              {
                required: true,
                message: '運送会社を入力してください',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="荷主"
            name="company"
            rules={[
              {
                required: true,
                message: '荷主を入力してください',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="車番"
            name="number"
            rules={[
              {
                required: true,
                message: '車番を入力してください',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="到着時間" rules={[
            {
              required: true,
              message: '時間を選んでください',
            },
          ]} >
            <input
              type="datetime-local"
              name="start"
              value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")}
              onChange={handleInputChange}
              required
            />

          </Form.Item>

          <Form.Item label="出発時間" rules={[
            {
              required: true,
              message: '時間を選んでください',
            },
          ]} >
            <input
              type="datetime-local"
              name="end"
              value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")}
              onChange={handleInputChange}
              required
            />

          </Form.Item>

          <Form.Item
            name="temperature"
            label="荷物の温度"
            rules={[
              {
                required: true,
                message: '温度を選んでください',
              },
            ]}
          >
            <Select placeholder="温度">
              <Option value="1">冷凍</Option>
              <Option value="2">常温</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="resourceId"
            label="バース"
            rules={[
              {
                required: true,
                message: 'バースを選んでください',
              },
            ]}
          >
            <Select placeholder="バース">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
              <Option value="5">5</Option>
              <Option value="6">6</Option>
            </Select>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="次へ">
              追加する
            </Button>
          </Form.Item>
        </Form>

      </Modal>
      {/* 変更画面 */}
      <Modal
        isOpen={modalIsOpen1}
        onRequestClose={closeModal1}
        contentLabel="変更"
        style={customStyles1}
      >
        <h3>予約変更</h3>

        <Form
          name="appointment"
          form={form}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
            zIndex: 1000
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish1}
          onFinishFailed={onFinishFailed1}
          autoComplete="off"
        >
          <Form.Item
            label="運送会社"
            name="title"
            rules={[
              {
                required: true,
                message: '運送会社を入力してください',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="荷主"
            name="company"
            rules={[
              {
                required: true,
                message: '荷主を入力してください',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="車番"
            name="number"
            rules={[
              {
                required: true,
                message: '車番を入力してください',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="到着時間" rules={[
            {
              required: true,
              message: '時間を選んでください',
            },
          ]} >
            <input
              type="datetime-local"
              name="start"
              value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")}
              onChange={handleInputChange}
              required
            />

          </Form.Item>

          <Form.Item label="出発時間" rules={[
            {
              required: true,
              message: '時間を選んでください',
            },
          ]} >
            <input
              type="datetime-local"
              name="end"
              value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")}
              onChange={handleInputChange}
              required
            />

          </Form.Item>

          <Form.Item
            name="temperature"
            label="荷物の温度"
            rules={[
              {
                required: true,
                message: 'Please select gender!',
              },
            ]}
          >
            <Select placeholder="温度を選んでください">
              <Option value="1">冷凍</Option>
              <Option value="2">常温</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="resourceId"
            label="バース"
            rules={[
              {
                required: true,
                message: 'バースを選んでください!',
              },
            ]}
          >
            <Select placeholder="バースを選んでください">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
              <Option value="5">5</Option>
              <Option value="6">6</Option>
            </Select>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: 'space-between' }}>
              <Button type="primary" htmlType="次へ">
                変更する
              </Button>
              <Button danger htmlType="次へ">
                削除する
              </Button>
            </div>

          </Form.Item>
        </Form>

      </Modal>
      {/* 確認画面 */}
      <Modal
        isOpen={modalIsOpen2}
        onRequestClose={closeModal2}
        contentLabel="予約画面"
        style={customStyles}
      >
        <Descriptions title="予約詳細" bordered items={items} />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px 0 40px' }}>
          <Button disabled={newEvent.status === '2'}>ドライバー呼び出し</Button>
          <Button onClick={checkChange} disabled={newEvent.status === '1' || newEvent.status === '2'}>予約変更/削除</Button>
          <Button onClick={checkIn} disabled={newEvent.status === '1' || newEvent.status === '2'}>チェックイン</Button>
          <Button onClick={checkOut} disabled={newEvent.status === '0' || newEvent.status === '2'}>チェックアウト</Button>
        </div>
      </Modal>
    </div>
  );
};

export default SchedulePage;