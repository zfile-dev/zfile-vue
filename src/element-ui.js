import Vue from 'vue';

import {
    Dialog,
    Menu,
    MenuItem,
    Input,
    Switch,
    Option,
    Button,
    Select,
    Table,
    TableColumn,
    Breadcrumb,
    BreadcrumbItem,
    Form,
    FormItem,
    Tabs,
    TabPane,
    Icon,
    Row,
    Col,
    Card,
    Popover,
    Badge,
    Link,
    Alert,
    Radio,
    Loading,
    Message,
    MessageBox,
    InfiniteScroll,
    Notification
} from 'element-ui';

// 按需加载 ElementUI
Vue.use(Dialog);
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(Input);
Vue.use(Switch);
Vue.use(Select);
Vue.use(Option);
Vue.use(Button);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Icon);
Vue.use(Row);
Vue.use(Col);
Vue.use(Card);
Vue.use(Popover);
Vue.use(Alert);
Vue.use(InfiniteScroll);
Vue.use(Loading);
Vue.use(Badge);
Vue.use(Link);
Vue.use(Radio);

Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;