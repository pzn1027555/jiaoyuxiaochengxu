// 教师个人信息编辑页面
const auth = require('../../../utils/auth')
const profileApi = require('../../../api/profile')
const subjectApi = require('../../../api/subject')
const api = require('../../../utils/api')
const { toAbsolute } = require('../../../utils/urlUtils')

Page({
  data: {
    // 顶部导航栏高度
    headerHeight: 0,
    
    // 用户资料信息
    userProfile: {
      avatar: '',
      name: '',
      gender: '',
      province: '',
      city: '',
      district: '',
      detailAddress: '',
      phone: '',
      subjects: [],
      teacherTags: [],
      introduction: ''
    },
    
    // 地区显示文本
    regionText: '',
    
    // 弹窗状态
    showAddressModal: false,
    showNameModal:false,
    showTagInputModal: false,
    tempDetailAddress: '',
    tempTagInput: '',
    
    // 搜索选择器状态（改为使用原生 picker，不再用弹层）
    
    // 原生 picker 选项数据
    
    // 选择器选项
    genderOptions: ['男', '女'],
    
    // 中国省市区数据
    regionData: [
      {
        name: '北京市',
        cities: [
          {
            name: '北京市',
            districts: ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区']
          }
        ]
      },
      {
        name: '天津市',
        cities: [
          {
            name: '天津市',
            districts: ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区', '宁河区', '静海区', '蓟州区']
          }
        ]
      },
      {
        name: '河北省',
        cities: [
          {
            name: '石家庄市',
            districts: ['长安区', '桥西区', '新华区', '井陉矿区', '裕华区', '藁城区', '鹿泉区', '栾城区', '井陉县', '正定县', '行唐县', '灵寿县', '高邑县', '深泽县', '赞皇县', '无极县', '平山县', '元氏县', '赵县', '辛集市', '晋州市', '新乐市']
          },
          {
            name: '唐山市',
            districts: ['路南区', '路北区', '古冶区', '开平区', '丰南区', '丰润区', '曹妃甸区', '滦南县', '乐亭县', '迁西县', '玉田县', '滦州市', '遵化市', '迁安市']
          },
          {
            name: '秦皇岛市',
            districts: ['海港区', '山海关区', '北戴河区', '抚宁区', '青龙满族自治县', '昌黎县', '卢龙县']
          }
        ]
      },
      {
        name: '山西省',
        cities: [
          {
            name: '太原市',
            districts: ['小店区', '迎泽区', '杏花岭区', '尖草坪区', '万柏林区', '晋源区', '清徐县', '阳曲县', '娄烦县', '古交市']
          },
          {
            name: '大同市',
            districts: ['新荣区', '平城区', '云冈区', '云州区', '阳高县', '天镇县', '广灵县', '灵丘县', '浑源县', '左云县']
          }
        ]
      },
      {
        name: '内蒙古自治区',
        cities: [
          {
            name: '呼和浩特市',
            districts: ['新城区', '回民区', '玉泉区', '赛罕区', '土默特左旗', '托克托县', '和林格尔县', '清水河县', '武川县']
          },
          {
            name: '包头市',
            districts: ['东河区', '昆都仑区', '青山区', '石拐区', '白云鄂博矿区', '九原区', '土默特右旗', '固阳县', '达尔罕茂明安联合旗']
          }
        ]
      },
      {
        name: '辽宁省',
        cities: [
          {
            name: '沈阳市',
            districts: ['和平区', '沈河区', '大东区', '皇姑区', '铁西区', '苏家屯区', '浑南区', '沈北新区', '于洪区', '辽中区', '康平县', '法库县', '新民市']
          },
          {
            name: '大连市',
            districts: ['中山区', '西岗区', '沙河口区', '甘井子区', '旅顺口区', '金州区', '普兰店区', '长海县', '瓦房店市', '庄河市']
          }
        ]
      },
      {
        name: '吉林省',
        cities: [
          {
            name: '长春市',
            districts: ['南关区', '宽城区', '朝阳区', '二道区', '绿园区', '双阳区', '九台区', '农安县', '榆树市', '德惠市']
          },
          {
            name: '吉林市',
            districts: ['昌邑区', '龙潭区', '船营区', '丰满区', '永吉县', '蛟河市', '桦甸市', '舒兰市', '磐石市']
          }
        ]
      },
      {
        name: '黑龙江省',
        cities: [
          {
            name: '哈尔滨市',
            districts: ['道里区', '南岗区', '道外区', '平房区', '松北区', '香坊区', '呼兰区', '阿城区', '双城区', '依兰县', '方正县', '宾县', '巴彦县', '木兰县', '通河县', '延寿县', '尚志市', '五常市']
          },
          {
            name: '齐齐哈尔市',
            districts: ['龙沙区', '建华区', '铁锋区', '昂昂溪区', '富拉尔基区', '碾子山区', '梅里斯达斡尔族区', '龙江县', '依安县', '泰来县', '甘南县', '富裕县', '克山县', '克东县', '拜泉县', '讷河市']
          }
        ]
      },
      {
        name: '上海市',
        cities: [
          {
            name: '上海市',
            districts: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区']
          }
        ]
      },
      {
        name: '江苏省',
        cities: [
          {
            name: '南京市',
            districts: ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区', '江宁区', '六合区', '溧水区', '高淳区']
          },
          {
            name: '无锡市',
            districts: ['锡山区', '惠山区', '滨湖区', '梁溪区', '新吴区', '江阴市', '宜兴市']
          },
          {
            name: '徐州市',
            districts: ['鼓楼区', '云龙区', '贾汪区', '泉山区', '铜山区', '丰县', '沛县', '睢宁县', '新沂市', '邳州市']
          },
          {
            name: '常州市',
            districts: ['天宁区', '钟楼区', '新北区', '武进区', '金坛区', '溧阳市']
          },
          {
            name: '苏州市',
            districts: ['虎丘区', '吴中区', '相城区', '姑苏区', '吴江区', '常熟市', '张家港市', '昆山市', '太仓市']
          }
        ]
      },
      {
        name: '浙江省',
        cities: [
          {
            name: '杭州市',
            districts: ['上城区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区', '临平区', '钱塘区', '富阳区', '临安区', '桐庐县', '淳安县', '建德市']
          },
          {
            name: '宁波市',
            districts: ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区', '奉化区', '象山县', '宁海县', '余姚市', '慈溪市']
          },
          {
            name: '温州市',
            districts: ['鹿城区', '龙湾区', '瓯海区', '洞头区', '永嘉县', '平阳县', '苍南县', '文成县', '泰顺县', '瑞安市', '乐清市', '龙港市']
          }
        ]
      },
      {
        name: '安徽省',
        cities: [
          {
            name: '合肥市',
            districts: ['瑶海区', '庐阳区', '蜀山区', '包河区', '长丰县', '肥东县', '肥西县', '庐江县', '巢湖市']
          },
          {
            name: '芜湖市',
            districts: ['镜湖区', '弋江区', '鸠江区', '三山区', '芜湖县', '繁昌县', '南陵县', '无为市']
          }
        ]
      },
      {
        name: '福建省',
        cities: [
          {
            name: '福州市',
            districts: ['鼓楼区', '台江区', '仓山区', '马尾区', '晋安区', '长乐区', '闽侯县', '连江县', '罗源县', '闽清县', '永泰县', '平潭县', '福清市']
          },
          {
            name: '厦门市',
            districts: ['思明区', '海沧区', '湖里区', '集美区', '同安区', '翔安区']
          }
        ]
      },
      {
        name: '江西省',
        cities: [
          {
            name: '南昌市',
            districts: ['东湖区', '西湖区', '青云谱区', '青山湖区', '新建区', '红谷滩区', '南昌县', '安义县', '进贤县']
          }
        ]
      },
      {
        name: '山东省',
        cities: [
          {
            name: '济南市',
            districts: ['历下区', '市中区', '槐荫区', '天桥区', '历城区', '长清区', '章丘区', '济阳区', '莱芜区', '钢城区', '平阴县', '商河县']
          },
          {
            name: '青岛市',
            districts: ['市南区', '市北区', '黄岛区', '崂山区', '李沧区', '城阳区', '即墨区', '胶州市', '平度市', '莱西市']
          }
        ]
      },
      {
        name: '河南省',
        cities: [
          {
            name: '郑州市',
            districts: ['中原区', '二七区', '管城回族区', '金水区', '上街区', '惠济区', '中牟县', '巩义市', '荥阳市', '新密市', '新郑市', '登封市']
          }
        ]
      },
      {
        name: '湖北省',
        cities: [
          {
            name: '武汉市',
            districts: ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区', '东西湖区', '汉南区', '蔡甸区', '江夏区', '黄陂区', '新洲区']
          }
        ]
      },
      {
        name: '湖南省',
        cities: [
          {
            name: '长沙市',
            districts: ['芙蓉区', '天心区', '岳麓区', '开福区', '雨花区', '望城区', '长沙县', '宁乡市', '浏阳市']
          }
        ]
      },
      {
        name: '广东省',
        cities: [
          {
            name: '广州市',
            districts: ['荔湾区', '越秀区', '海珠区', '天河区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '从化区', '增城区']
          },
          {
            name: '韶关市',
            districts: ['武江区', '浈江区', '曲江区', '始兴县', '仁化县', '翁源县', '乳源瑶族自治县', '新丰县', '乐昌市', '南雄市']
          },
          {
            name: '深圳市',
            districts: ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区', '盐田区', '龙华区', '坪山区', '光明区', '大鹏新区']
          },
          {
            name: '珠海市',
            districts: ['香洲区', '斗门区', '金湾区']
          },
          {
            name: '汕头市',
            districts: ['龙湖区', '金平区', '濠江区', '潮阳区', '潮南区', '澄海区', '南澳县']
          },
          {
            name: '佛山市',
            districts: ['禅城区', '南海区', '顺德区', '三水区', '高明区']
          },
          {
            name: '江门市',
            districts: ['蓬江区', '江海区', '新会区', '台山市', '开平市', '鹤山市', '恩平市']
          },
          {
            name: '湛江市',
            districts: ['赤坎区', '霞山区', '坡头区', '麻章区', '遂溪县', '徐闻县', '廉江市', '雷州市', '吴川市']
          },
          {
            name: '茂名市',
            districts: ['茂南区', '电白区', '高州市', '化州市', '信宜市']
          },
          {
            name: '肇庆市',
            districts: ['端州区', '鼎湖区', '高要区', '广宁县', '怀集县', '封开县', '德庆县', '四会市']
          },
          {
            name: '惠州市',
            districts: ['惠城区', '惠阳区', '博罗县', '惠东县', '龙门县']
          },
          {
            name: '梅州市',
            districts: ['梅江区', '梅县区', '大埔县', '丰顺县', '五华县', '平远县', '蕉岭县', '兴宁市']
          },
          {
            name: '汕尾市',
            districts: ['城区', '海丰县', '陆河县', '陆丰市']
          },
          {
            name: '河源市',
            districts: ['源城区', '紫金县', '龙川县', '连平县', '和平县', '东源县']
          },
          {
            name: '阳江市',
            districts: ['江城区', '阳东区', '阳西县', '阳春市']
          },
          {
            name: '清远市',
            districts: ['清城区', '清新区', '佛冈县', '阳山县', '连山壮族瑶族自治县', '连南瑶族自治县', '英德市', '连州市']
          },
          {
            name: '东莞市',
            districts: ['东莞市']
          },
          {
            name: '中山市',
            districts: ['中山市']
          },
          {
            name: '潮州市',
            districts: ['湘桥区', '潮安区', '饶平县']
          },
          {
            name: '揭阳市',
            districts: ['榕城区', '揭东区', '揭西县', '惠来县', '普宁市']
          },
          {
            name: '云浮市',
            districts: ['云城区', '云安区', '新兴县', '郁南县', '罗定市']
          }
        ]
      },
      {
        name: '广西壮族自治区',
        cities: [
          {
            name: '南宁市',
            districts: ['兴宁区', '青秀区', '江南区', '西乡塘区', '良庆区', '邕宁区', '武鸣区', '隆安县', '马山县', '上林县', '宾阳县', '横县']
          }
        ]
      },
      {
        name: '海南省',
        cities: [
          {
            name: '海口市',
            districts: ['秀英区', '龙华区', '琼山区', '美兰区']
          },
          {
            name: '三亚市',
            districts: ['海棠区', '吉阳区', '天涯区', '崖州区']
          }
        ]
      },
      {
        name: '重庆市',
        cities: [
          {
            name: '重庆市',
            districts: ['万州区', '涪陵区', '渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '綦江区', '大足区', '渝北区', '巴南区', '黔江区', '长寿区', '江津区', '合川区', '永川区', '南川区', '璧山区', '铜梁区', '潼南区', '荣昌区', '开州区', '梁平区', '武隆区']
          }
        ]
      },
      {
        name: '四川省',
        cities: [
          {
            name: '成都市',
            districts: ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '青白江区', '新都区', '温江区', '双流区', '郫都区', '新津区', '金堂县', '大邑县', '蒲江县', '都江堰市', '彭州市', '邛崃市', '崇州市', '简阳市']
          }
        ]
      },
      {
        name: '贵州省',
        cities: [
          {
            name: '贵阳市',
            districts: ['南明区', '云岩区', '花溪区', '乌当区', '白云区', '观山湖区', '开阳县', '息烽县', '修文县', '清镇市']
          }
        ]
      },
      {
        name: '云南省',
        cities: [
          {
            name: '昆明市',
            districts: ['五华区', '盘龙区', '官渡区', '西山区', '东川区', '呈贡区', '晋宁区', '富民县', '宜良县', '石林彝族自治县', '嵩明县', '禄劝彝族苗族自治县', '寻甸回族彝族自治县', '安宁市']
          }
        ]
      },
      {
        name: '西藏自治区',
        cities: [
          {
            name: '拉萨市',
            districts: ['城关区', '堆龙德庆区', '达孜区', '林周县', '当雄县', '尼木县', '曲水县', '墨竹工卡县']
          }
        ]
      },
      {
        name: '陕西省',
        cities: [
          {
            name: '西安市',
            districts: ['新城区', '碑林区', '莲湖区', '灞桥区', '未央区', '雁塔区', '阎良区', '临潼区', '长安区', '高陵区', '鄠邑区', '蓝田县', '周至县']
          }
        ]
      },
      {
        name: '甘肃省',
        cities: [
          {
            name: '兰州市',
            districts: ['城关区', '七里河区', '西固区', '安宁区', '红古区', '永登县', '皋兰县', '榆中县']
          }
        ]
      },
      {
        name: '青海省',
        cities: [
          {
            name: '西宁市',
            districts: ['城东区', '城中区', '城西区', '城北区', '湟中区', '湟源县', '大通回族土族自治县']
          }
        ]
      },
      {
        name: '宁夏回族自治区',
        cities: [
          {
            name: '银川市',
            districts: ['兴庆区', '西夏区', '金凤区', '永宁县', '贺兰县', '灵武市']
          }
        ]
      },
      {
        name: '新疆维吾尔自治区',
        cities: [
          {
            name: '乌鲁木齐市',
            districts: ['天山区', '沙依巴克区', '新市区', '水磨沟区', '头屯河区', '达坂城区', '米东区', '乌鲁木齐县']
          }
        ]
      }
    ],
    
    // 科目二级数据结构（从后端加载，二级元素包含 id 与 name）
    subjectOptions: [],
    displaySubjects: [],
    subjectIdNameMap: {},
    showSubjectPicker: false,
    selectedSubjectsForPicker: [],
    
    // 当前选择的索引
    regionPickerValue: [0, 0, 0],
    
    // picker显示用的数组
    regionPickerRange: [[], [], []]
  },

  onLoad(options) {
    console.log('个人信息编辑页面加载', options)
    this.checkAuth()
    this.loadSubjectCategories()
    this.loadUserProfile()
    this.initPickerData()
    this.initializeSelectors()
  },
  
  // 初始化选择器数据
  initializeSelectors() {
    // 提取省份选项
    const provinceOptions = this.data.regionData.map(item => item.name)
    this.setData({ provinceOptions })
  },

  // 检查权限
  checkAuth() {
    const app = getApp()
    
    // 首先检查app.globalData
    if (app.globalData.isLogin && app.globalData.userRole === 'teacher') {
      console.log('教师已登录，继续页面操作')
      return true
    }
    
    // 备用检查：检查本地存储
    const userInfo = auth.getUserInfo()
    if (userInfo && userInfo.role === 'teacher') {
      console.log('从本地存储确认教师身份')
      return true
    }
    
    // 都没有则需要登录
    console.log('教师身份验证失败，跳转登录')
    wx.showToast({
      title: '请先登录教师账号',
      icon: 'none'
    })
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }, 2000)
    return false
  },

  // 初始化picker数据
  initPickerData() {
    // 初始化科目picker数据
    const subjectCategories = this.data.subjectOptions.map(item => item.name)
    const firstCategorySubjects = this.data.subjectOptions[0] ? this.data.subjectOptions[0].subjects.map(s=>s.name) : []
    
    // 初始化省市区picker数据
    const provinces = this.data.regionData.map(item => item.name)
    const firstProvinceCities = this.data.regionData[0] ? this.data.regionData[0].cities.map(item => item.name) : []
    const firstCityDistricts = this.data.regionData[0] && this.data.regionData[0].cities[0] ? this.data.regionData[0].cities[0].districts : []
    
    this.setData({
      subjectPickerRange: [subjectCategories, firstCategorySubjects],
      regionPickerRange: [provinces, firstProvinceCities, firstCityDistricts]
    })
  },

  // 顶部导航栏准备完成
  onHeaderReady(e) {
    const { totalHeight } = e.detail
    this.setData({
      headerHeight: totalHeight
    })
  },

  // 处理返回按钮点击
  onBackTap() {
    // 可以在这里添加自定义返回逻辑
    // 如果没有特殊处理，组件会自动执行默认返回
  },

  // 加载用户资料
  async loadUserProfile() {
    try {
      wx.showLoading({ title: '加载中...' })
      
      const response = await profileApi.getUserProfile()
      
      if (response.success) {
        const profile = response.data
        
        // 转换数据格式以适配前端
        // 兼容新结构：后端 subjects = [{id,name}], subjectIds = [id]
        const subjectIds = Array.isArray(profile.subjectIds) ? profile.subjectIds : (Array.isArray(profile.subjects) && profile.subjects.length && typeof profile.subjects[0] === 'object' ? profile.subjects.map(s=>s.id) : (profile.subjects||[]))
        const subjectDisplayList = Array.isArray(profile.subjects) && profile.subjects.length && typeof profile.subjects[0] === 'object'
          ? profile.subjects.map(s => ({ id: s.id, name: s.name }))
          : subjectIds.map(id => ({ id, name: String(id) }))

        const userProfile = {
          avatar: profile.avatar || '',
          name: profile.name || '',
          gender: this.convertGenderToText(profile.gender),
          province: profile.province || '',
          city: profile.city || '',
          district: profile.district || '',
          detailAddress: profile.address || '',
          phone: profile.phone || '',
          subjects: subjectIds || [],
          teacherTags: profile.teacherTags || [],
          introduction: profile.introduction || ''
        }
        
        // 构建地区显示文本
        const regionText = this.buildRegionText(userProfile.province, userProfile.city, userProfile.district)
        
        this.setData({
          userProfile: userProfile,
          regionText: regionText,
          // 直接用后端返回的对象数组作为展示初值
          displaySubjects: subjectDisplayList
        })
        this.refreshDisplaySubjects()
        
        // 更新全局用户信息
        const app = getApp()
        if (app.globalData.userInfo) {
          app.globalData.userInfo.name = userProfile.name
          app.globalData.userInfo.avatar = userProfile.avatar
        }
      } else {
        console.error('获取用户资料失败:', response.message)
        wx.showToast({
          title: response.message || '获取资料失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载用户资料出错:', error)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 选择头像
  selectAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        try {
          const filePath = res && res.tempFilePaths && res.tempFilePaths[0]
          if (!filePath) return
          wx.showLoading({ title: '上传中...' })
          const up = await api.upload.image(filePath)
          const rel = (up && up.data && (up.data.url || up.data.path)) || (up && up.url) || ''
          const url = toAbsolute(rel, 'upload')
          wx.hideLoading()
          if (url) {
            this.setData({ 'userProfile.avatar': url })
            wx.showToast({ title: '上传成功', icon: 'success' })
          } else {
            wx.showToast({ title: '上传失败', icon: 'none' })
          }
        } catch (error) {
          wx.hideLoading()
          console.error('上传头像失败:', error)
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      },
      fail: (error) => {
        console.error('选择头像失败:', error)
      }
    })
  },

  // 姓名输入
  onNameInput(e) {
    this.setData({
      'userProfile.name': e.detail.value
    })
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      'userProfile.phone': e.detail.value
    })
  },

  // 简介输入
  onIntroductionInput(e) {
    this.setData({
      'userProfile.introduction': e.detail.value
    })
  },

  // 选择性别
  selectGender() {
    wx.showActionSheet({
      itemList: this.data.genderOptions,
      success: (res) => {
        const gender = this.data.genderOptions[res.tapIndex]
        this.setData({
          'userProfile.gender': gender
        })
      }
    })
  },

  onGenderChange(e) {
    const index = e.detail.value
    const gender = this.data.genderOptions[index]
    this.setData({
      'userProfile.gender': gender
    })
  },

  // 选择地区（picker已经包装在UI中，这个方法不再需要）
  selectRegion() {
    // picker会自动触发
  },

  // 地区选择变化
  onRegionColumnChange(e) {
    const { column, value } = e.detail
    const { regionPickerValue, regionData, regionPickerRange } = this.data
    
    if (column === 0) {
      // 选择省份时，更新城市列表并重置市区选择
      const newCities = regionData[value] ? regionData[value].cities.map(item => item.name) : []
      const newDistricts = regionData[value] && regionData[value].cities[0] ? regionData[value].cities[0].districts : []
      const newRegionPickerRange = [regionPickerRange[0], newCities, newDistricts]
      
      this.setData({
        regionPickerValue: [value, 0, 0],
        regionPickerRange: newRegionPickerRange
      })
    } else if (column === 1) {
      // 选择城市时，更新区县列表并重置区选择
      const newDistricts = regionData[regionPickerValue[0]] && regionData[regionPickerValue[0]].cities[value] ? regionData[regionPickerValue[0]].cities[value].districts : []
      const newRegionPickerRange = [regionPickerRange[0], regionPickerRange[1], newDistricts]
      
      this.setData({
        regionPickerValue: [regionPickerValue[0], value, 0],
        regionPickerRange: newRegionPickerRange
      })
    }
  },

  // 地区选择确认
  onRegionChange(e) {
    const [provinceIndex, cityIndex, districtIndex] = e.detail.value
    const selectedProvince = this.data.regionData[provinceIndex]
    const selectedCity = selectedProvince.cities[cityIndex]
    const selectedDistrict = selectedCity.districts[districtIndex]
    
    this.setData({
      'userProfile.province': selectedProvince.name,
      'userProfile.city': selectedCity.name,
      'userProfile.district': selectedDistrict,
      regionText: `${selectedProvince.name}${selectedCity.name}${selectedDistrict}`,
      regionPickerValue: [provinceIndex, cityIndex, districtIndex]
    })
  },

  // 取消地区选择
  onRegionCancel() {
    // 选择器取消时不需要特殊处理
  },
  // 编辑详细地址
  editDetailAddress() {
    this.setData({
      showAddressModal: true,
      tempDetailAddress: this.data.userProfile.detailAddress
    })
  },
  editDetailName() {
    this.setData({
      showNameModal: true,
      tempDetailName: this.data.userProfile.name
    })
  },
  onDetailAddressInput(e) {
    this.setData({
      tempDetailAddress: e.detail.value
    })
  },
  onDetailNameInput(e) {
    this.setData({
      tempDetailName: e.detail.value
    })
  },
  confirmDetailAddress() {
    this.setData({
      'userProfile.detailAddress': this.data.tempDetailAddress,
      showAddressModal: false
    })
  },
  confirmDetailName() {
    this.setData({
      'userProfile.name': this.data.tempDetailName,
      showNameModal: false
    })
  },
  hideNameModal() {
    this.setData({
      showNameModal: false
    })
  },
  hideAddressModal() {
    this.setData({
      showAddressModal: false
    })
  },

  // 添加科目（这个方法已经不需要了，会直接通过picker触发）
  addSubject() {
    // picker会自动触发
  },

  // 科目选择变化
  onSubjectColumnChange(e) {
    const { column, value } = e.detail
    const { subjectPickerValue, subjectPickerRange } = this.data
    
    if (column === 0) {
      // 选择分类时，更新科目列表并重置科目选择
      const newSubjects = this.data.subjectOptions[value] ? this.data.subjectOptions[value].subjects.map(s=>s.name) : []
      const newSubjectPickerRange = [subjectPickerRange[0], newSubjects]
      
      this.setData({
        subjectPickerValue: [value, 0],
        subjectPickerRange: newSubjectPickerRange
      })
    }
  },

  // 科目选择确认（保存为二级科目ID）
  onSubjectChange(e) {
    const [categoryIndex, subjectIndex] = e.detail.value
    const selectedCategory = this.data.subjectOptions[categoryIndex]
    const selectedSubject = selectedCategory && selectedCategory.subjects ? selectedCategory.subjects[subjectIndex] : null
    const subjectId = selectedSubject && selectedSubject.id
    if (!subjectId) return
    const list = Array.isArray(this.data.userProfile.subjects) ? this.data.userProfile.subjects : []
    if (list.includes(subjectId)) {
      wx.showToast({ title: '该科目已添加', icon: 'none' })
      return
    }
    const subjects = [...list, subjectId]
    this.setData({ 'userProfile.subjects': subjects, subjectPickerValue: [categoryIndex, subjectIndex] })
    this.refreshDisplaySubjects()
  },

  // 取消科目选择
  onSubjectCancel() {
    // 选择器取消时不需要特殊处理
  },

  // 移除科目
  removeSubject(e) {
    const id = e.currentTarget.dataset.id
    let subjects = Array.isArray(this.data.userProfile.subjects) ? this.data.userProfile.subjects : []
    if (id !== undefined && id !== null) {
      subjects = subjects.filter(sid => String(sid) !== String(id))
    } else {
      const index = e.currentTarget.dataset.index
      subjects = subjects.filter((_, i) => i !== index)
    }
    this.setData({ 'userProfile.subjects': subjects })
    this.refreshDisplaySubjects()
  },

  // 添加教师标签
  addTeacherTag() {
    this.setData({
      showTagInputModal: true,
      tempTagInput: ''
    })
  },

  // 标签输入
  onTagInput(e) {
    this.setData({
      tempTagInput: e.detail.value
    })
  },

  // 确认添加标签
  confirmAddTag() {
    const tagText = this.data.tempTagInput.trim()
    
    if (!tagText) {
      wx.showToast({
        title: '请输入标签内容',
        icon: 'none'
      })
      return
    }
    
    // 检查是否已经添加过
    if (this.data.userProfile.teacherTags.includes(tagText)) {
      wx.showToast({
        title: '该标签已添加',
        icon: 'none'
      })
      return
    }
    
    const teacherTags = [...this.data.userProfile.teacherTags, tagText]
    this.setData({
      'userProfile.teacherTags': teacherTags,
      showTagInputModal: false,
      tempTagInput: ''
    })
  },

  // 隐藏标签输入弹窗
  hideTagInputModal() {
    this.setData({
      showTagInputModal: false,
      tempTagInput: ''
    })
  },



  // 移除教师标签
  removeTeacherTag(e) {
    const index = e.currentTarget.dataset.index
    const teacherTags = this.data.userProfile.teacherTags.filter((_, i) => i !== index)
    this.setData({
      'userProfile.teacherTags': teacherTags
    })
  },

  // 显示菜单
  showMenu() {
    wx.showActionSheet({
      itemList: ['帮助', '反馈问题', '设置'],
      success: (res) => {
        console.log('菜单选择:', res.tapIndex)
        switch (res.tapIndex) {
          case 0:
            this.showHelp()
            break
          case 1:
            this.showFeedback()
            break
          case 2:
            this.showSettings()
            break
        }
      }
    })
  },

  // 显示录制选项
  showRecordOptions() {
    wx.showActionSheet({
      itemList: ['录制视频介绍', '录制语音介绍'],
      success: (res) => {
        console.log('录制选择:', res.tapIndex)
        switch (res.tapIndex) {
          case 0:
            this.recordVideo()
            break
          case 1:
            this.recordAudio()
            break
        }
      }
    })
  },

  // 保存个人资料
  async saveProfile() {
    const { userProfile } = this.data
    
    // 基本验证
    if (!userProfile.name || !userProfile.name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }
    
    if (!userProfile.phone || !userProfile.phone.trim()) {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none'
      })
      return
    }
    
    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(userProfile.phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
      return
    }
    
    try {
      wx.showLoading({ title: '保存中...' })
      
      // 转换数据格式以适配后端
      const requestData = {
        name: userProfile.name,
        avatar: userProfile.avatar,
        gender: this.convertTextToGender(userProfile.gender),
        province: userProfile.province,
        city: userProfile.city,
        district: userProfile.district,
        address: userProfile.detailAddress,
        phone: userProfile.phone,
        subjects: userProfile.subjects,
        teacherTags: userProfile.teacherTags,
        introduction: userProfile.introduction
      }
      
      const response = await profileApi.updateUserProfile(requestData)
      
      if (response.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        // 更新全局用户信息
        const app = getApp()
        if (app.globalData.userInfo) {
          app.globalData.userInfo.name = userProfile.name
          app.globalData.userInfo.phone = userProfile.phone
          app.globalData.userInfo.avatar = userProfile.avatar
        }
        
        // 设置数据更新标志，通知其他页面刷新
        app.globalData.profileUpdated = true
        
        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        console.error('保存用户资料失败:', response.message)
        wx.showToast({
          title: response.message || '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存用户资料出错:', error)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 帮助功能
  showHelp() {
    wx.showModal({
      title: '使用帮助',
      content: '1. 完善个人信息有助于提高教学匹配度\n2. 上传清晰的头像照片\n3. 详细填写教学科目和认证标签\n4. 编写有吸引力的个人简介',
      showCancel: false
    })
  },

  // 反馈功能
  showFeedback() {
    wx.showToast({
      title: '反馈功能开发中',
      icon: 'none'
    })
  },

  // 设置功能
  showSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    })
  },

  // 录制视频
  recordVideo() {
    wx.showToast({
      title: '录制视频功能开发中',
      icon: 'none'
    })
  },

  // 录制音频
  recordAudio() {
    wx.showToast({
      title: '录制音频功能开发中',
      icon: 'none'
    })
  },

  // 阻止弹窗关闭
  preventClose() {
    // 空函数，阻止事件冒泡
  },

  // 转换性别数字为文本
  convertGenderToText(gender) {
    switch (gender) {
      case 1:
        return '男'
      case 2:
        return '女'
      default:
        return ''
    }
  },

  // 转换性别文本为数字
  convertTextToGender(gender) {
    switch (gender) {
      case '男':
        return 1
      case '女':
        return 2
      default:
        return null
    }
  },

  // 构建地区显示文本
  buildRegionText(province, city, district) {
    let text = ''
    if (province) text += province
    if (city) text += city
    if (district) text += district
    return text
  },

  // 选择器旧逻辑移除，统一用内置 multiSelector 的 onRegionChange/onRegionColumnChange

  // 加载科目分类数据（统一调用 utils/request，映射为二级 picker 数据）
  async loadSubjectCategories() {
    try {
      const result = await subjectApi.getSubjectCategories()
      if (result && result.success && result.data && Array.isArray(result.data.categories)) {
        const categories = result.data.categories
        const subjectOptions = categories.map(level1 => ({
          name: level1.categoryName,
          subjects: Array.isArray(level1.children) ? level1.children.map(level2 => ({ id: level2.id, name: level2.categoryName })) : []
        }))
        if (subjectOptions.length > 0) {
          const idName = {}
          subjectOptions.forEach(l1 => (l1.subjects||[]).forEach(s=> { if(s && (s.id!=null)) idName[String(s.id)] = s.name }))
          this.setData({
            subjectOptions,
            subjectIdNameMap: idName,
            selectedSubjectsForPicker: this.buildSelectedList(this.data.userProfile.subjects, subjectOptions)
          })
          this.refreshDisplaySubjects()
        }
      }
    } catch (error) {
      console.error('加载科目分类失败:', error)
    }
  },

  // 根据 subjects 的ID映射展示中文名
  refreshDisplaySubjects() {
    try{
        const ids = Array.isArray(this.data.userProfile.subjects) ? this.data.userProfile.subjects : []
        const map = this.data.subjectIdNameMap || {}
        // 优先保留当前 displaySubjects 中已有的人性化名称，避免回退为 id
        const current = Array.isArray(this.data.displaySubjects) ? this.data.displaySubjects : []
        const currentNameById = {}
        current.forEach(it => { if (it && it.id != null) currentNameById[String(it.id)] = it.name || String(it.id) })
        const items = ids.map(id => {
          const key = String(id)
          const nameFromMap = map[key] || map[id]
          const name = nameFromMap || currentNameById[key] || String(id)
          return { id, name }
        })
        this.setData({ 
          displaySubjects: items,
          selectedSubjectsForPicker: this.buildSelectedList(ids, this.data.subjectOptions)
        })
    }catch(e){ /* noop */ }
  },

  openSubjectPicker() {
    this.setData({
      showSubjectPicker: true,
      selectedSubjectsForPicker: this.buildSelectedList(this.data.userProfile.subjects, this.data.subjectOptions)
    })
  },
  closeSubjectPicker() {
    this.setData({ showSubjectPicker: false })
  },
  onSubjectPickerConfirm(e) {
    const value = e.detail && e.detail.value ? e.detail.value : []
    const ids = value.map(item => item.id)
    this.setData({
      'userProfile.subjects': ids,
      showSubjectPicker: false,
      // 展示用对象数组，name 直接使用组件返回
      displaySubjects: value.map(v => ({ id: v && v.id, name: (v && v.name) || String(v && v.id || '') }))
    })
    this.refreshDisplaySubjects()
  },
  buildSelectedList(ids, options = []) {
    if (!Array.isArray(ids) || !ids.length) return []
    const result = []
    ids.forEach(id => {
      let found = null
      options.forEach(level1 => {
        (level1.subjects || []).forEach(level2 => {
          if (String(level2.id) === String(id)) {
            found = { id: level2.id, name: level2.name, parentName: level1.name }
          }
        })
      })
      if (!found) {
        const map = this.data.subjectIdNameMap || {}
        const fallback = map[String(id)] || map[id] || String(id)
        found = { id, name: fallback, parentName: '' }
      }
      result.push(found)
    })
    return result
  },

  // 更新地区显示文本
  updateRegionText() {
    const { province, city, district } = this.data.userProfile
    const regionText = this.buildRegionText(province, city, district)
    this.setData({ regionText })
  }
})
