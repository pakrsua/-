import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import toast from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import styles from '../../../../styles/pages/productPage.module.scss';
import CategoryContent from '../../categoryContent';
import ProductNutritionSheet from './productNutritionSheet';
import ProductOrder from './productOrder';
import ToolbarList from '../../ui/toolbarList';
import CustomAlert from '../../customAlert';
import { useRouter } from 'next/router';
import { addMyMenu } from '../../../../src/store/api/myMenu';
import {
  getSize,
  getNutrition,
  getProduct,
} from '../../../../src/store/api/category';
import { addCart, getCount } from '../../../../src/store/api/cart';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  categoryLNameState,
  categoryLState,
  categorySIdState,
} from '../../../store/atom/categoryState';
import {
  ICartData,
  ICartNonMemberData,
  IDetail,
  ISize,
  INutrition,
} from '../../../types/productDetail';
import { IParams } from '../../../types/myMenu';
import { cartCntState, tokenState } from '../../../store/atom/userStates';
import { addComma } from '../../../store/utils/function';
import { getSessionCartCount } from '../../../store/utils/cart';
import MyMenuRenamePopUp from '../myMenuRenamePopUp';
import {
  orderInfoState,
  selectedStoreState,
} from '../../../store/atom/orderState';
import { loginState } from './../../../store/atom/userStates';
import { RightArrowBtn } from '../../../../public/assets/svg';

const cx = classNames.bind(styles);

function productContent() {
  const router = useRouter();
  const isSoldOut = router.query.isSoldOut;
  const id = router.query.id ? +router.query.id : 1;
  const isLogin = useRecoilValue(loginState);
  const token = useRecoilValue(tokenState);
  const [categoryLName] = useRecoilState(categoryLNameState);
  const [, setCategoryName] = useRecoilState(categoryLState);
  const [, setCategorySId] = useRecoilState(categorySIdState);
  const [selectedStore] = useRecoilState(selectedStoreState);
  const [cartCount, setCartCount] = useRecoilState(cartCntState);
  const orderInfo = useRecoilValue(orderInfoState);
  const [open, setOpen] = useState(false);
  const [soldOutMenu, setSoldOutMenu] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [sizeOpt, setSizeOpt] = useState<ISize[]>();
  const [selectedSizeId, setSelectedSizeId] = useState(0);
  const [selectedSizeTxt, setSelectedSizeTxt] = useState('');
  const [cupChoice, setCupChoice] = useState('');
  const [isClick, setIsClick] = useRecoilState(categoryLState);
  const [count, setCount] = useState(1);
  const [detailList, setdetailList] = useState<IDetail>();
  const [selectedTempId, setSelectedTempId] = useState<number>(0);
  const [temperatureChoice, setTemperatureChoice] = useState(0);
  const [nutritionInfo, setNutritionInfo] = useState<INutrition>();
  const [nutritionSize, setNutritionSize] = useState('Tall');
  const [myMenuAlert, setMyMenuAlert] = useState(false);
  const [myMenuName, setMyMenuName] = useState('');
  const [myMenuData, setMyMenuData] = useState<IParams>({
    sizeId: 2,
    alias: '',
    cupType: '',
    personalOptionList: [],
  });
  const [cartData, setCartData] = useState<ICartData>({
    // 사이즈, 개수, 컵 종류, 온도
    sizeId: 1,
    quantity: 1,
    cupType: '',
    personalOptionList: [],
  });
  const [nonMemberData, setNonMemberData] = useState<ICartNonMemberData>({
    options: {
      sizeId: 1,
      quantity: 1,
      cupType: '',
      personalOptionList: [],
    },
    menuImg: '',
    menuName: '',
    menuEngName: '',
    temperature: '',
    totalMenuPrice: '',
  });

  const handleOptionOpen = () => {
    setOpen(true);
  };
  const handleNutritionOpen = () => {
    setNutritionOpen(true);
  };
  const handleClose = () => {
    console.log('click');
    setMyMenuAlert(!myMenuAlert);
    console.log(myMenuAlert);
  };

  const handleAddCart = () => {
    if (cupChoice === '') {
      toast.error('컵을 선택하세요.');
    } else {
      const sum = cartCount + count;
      if (sum > 20) {
        toast.error('총 20개까지 담을 수 있습니다.');
        return;
      }

      console.log(cartData);
      if (!isLogin) {
        // 사진, 이름, 영문, 온도, 컵 사이즈, 컵 종류, 양, 가격
        sessionStorage.setItem(
          sessionStorage.length + '',
          JSON.stringify(cartData),
        );
        setCartCount(getSessionCartCount());
        setOpen(false);
        toast.success('장바구니에 담겼습니다!');
      } else {
        addCart(cartData, token).then(res => {
          if (res.data.data) {
            setOpen(false);
            toast.success('장바구니에 담겼습니다!');
          } else {
            toast.error(
              '장바구니에 담을 수 없습니다. 잠시 후 다시 시도해주세요.',
            );
          }
        });
      }
    }
  };

  const myMenuNameRef = useRef<HTMLInputElement>(null);

  const handleOrder = () => {
    if (orderInfo.purchaseId !== 0) {
      toast('진행 중인 주문이 있습니다.', {
        icon: '📢',
      });
      return;
    }

    if (cupChoice === '') {
      toast.error('컵을 선택하세요.');
      return;
    }

    if (selectedStore.distance === '') {
      setOpen(false);
      confirmAlert({
        customUI: ({ onClose }) => (
          <>
            <CustomAlert
              title='주문할 매장을 선택해주세요.'
              desc='매장을 선택하신 후 주문해주세요! 품절된 상품은 주문하실 수 없습니다.'
              btnTitle='매장 선택하기'
              // id={}
              onAction={onSelectStore}
              onClose={onClose}
            />
          </>
        ),
      });
    } else {
      console.log('선택된 매장', selectedStore);
      console.log('선택된 사이즈아이디', selectedSizeId);
      router.push(
        {
          pathname: '/order',
          query: {
            sizeId: selectedSizeId,
            qty: count,
            optionList: [],
            storeId: selectedStore.storeId,
            storeName: selectedStore.name,
            storeAddress: selectedStore.address,
            storeContactNumber: selectedStore.contactNumber,
            cupType: cupChoice,
          },
        },
        '/order',
      );
    }
  };

  const onSelectStore = () => {
    console.log('id', selectedSizeId);
    console.log('qty', count);
    router.push(
      {
        pathname: '/selectStore',
        query: {
          sizeId: selectedSizeId,
          qty: count,
          cupType: cupChoice,
          optionList: [],
        },
      },
      '/selectStore',
    );
  };

  const handleTempChoice = (e: string, tempId: number) => {
    if (e === 'hot') setTemperatureChoice(1);
    else setTemperatureChoice(0);

    if (detailList && detailList.temperatureList.length === 1) {
      setSelectedTempId(detailList.temperatureList[0].temperatureId);
    } else {
      setSelectedTempId(tempId);
    }
  };

  function onDismiss() {
    setOpen(false);
    setNutritionOpen(false);
  }

  const onLogin = () => {
    router.push('/login');
  };

  const handleAddMyMenu = () => {
    if (!isLogin) {
      setOpen(false);
      confirmAlert({
        customUI: ({ onClose }) => (
          <CustomAlert
            title='로그인'
            desc='로그인이 필요한 서비스입니다. 로그인 하시겠습니까?'
            btnTitle='로그인'
            // id={}
            onAction={onLogin}
            onClose={onClose}
          />
        ),
      });
      return;
    }

    if (selectedSizeTxt === '' || cupChoice === '') {
      toast.error('사이즈와 컵을 선택해주세요');
      return;
    } else {
      setOpen(false);
      setMyMenuAlert(true);
    }
  };

  const handleAddMyMenuData = () => {
    const mymenuNameValue = myMenuNameRef.current?.value;
    console.log('myMenuName:', mymenuNameValue);
    if (mymenuNameValue && mymenuNameValue.length !== 0) {
      setMyMenuData({
        ...myMenuData,
        alias: mymenuNameValue,
        sizeId: selectedSizeId,
        cupType: cupChoice,
      });
      const value = {
        sizeId: selectedSizeId,
        alias: mymenuNameValue,
        cupType: cupChoice,
        personalOptionList: myMenuData.personalOptionList,
      };
      addMyMenu(value, token).then(res => {
        console.log(res);
        if (res.data.data) {
          toast.success('나만의 메뉴에 추가되었습니다');
          setMyMenuAlert(false);
        } else {
          toast.error('이미 등록된 상품입니다.');
          setMyMenuAlert(false);
        }
      });
    }
  };

  useEffect(() => {
    setSoldOutMenu(false);
    if (isSoldOut === 'true' && selectedStore.storeId !== 0)
      setSoldOutMenu(true);
    else setSoldOutMenu(false);
  }, [soldOutMenu]);

  useEffect(() => {
    getProduct(id).then(res => {
      setdetailList(res.data.data);
      console.log('getProduct', res.data.data);
    });
    getNutrition(id).then(res => {
      setNutritionInfo(res.data.data);
    });
    if (isLogin) {
      // 회원 장바구니 개수
      getCount(token).then(res => {
        const resData = res.data.data === null ? 0 : res.data.data;
        setCartCount(resData);
      });
    } else {
      // 비회원 장바구니 개수
      setCartCount(getSessionCartCount());
    }
  }, [id, open]);

  useEffect(() => {
    if (detailList) {
      if (detailList.temperatureList.length === 1) {
        console.log(detailList.temperatureList[0].temperatureId);
        if (detailList.temperatureList[0].temperatureId < 66) {
          setSelectedTempId(detailList.temperatureList[0].temperatureId);
          getSize(detailList.temperatureList[0].temperatureId).then(res => {
            setSizeOpt(res.data.data);
            setSelectedSizeId(res.data.data[0].sizeId);
            setSelectedSizeTxt(res.data.data[0].size);
            setCartData({
              ...cartData,
              sizeId: res.data.data[0].sizeId,
            });
          });
        }
      } else {
        let tempId = selectedTempId;
        if (tempId === 0) {
          tempId = detailList.temperatureList[0].temperatureId;
        }
        getSize(tempId).then(res => {
          setSizeOpt(res.data.data);
          setSelectedSizeTxt(res.data.data[0].size);
          setSelectedSizeId(res.data.data[0].sizeId);
          setCartData({
            ...cartData,
            sizeId: res.data.data[0].sizeId,
          });
        });
      }
    }
  }, [detailList, temperatureChoice]);

  // useEffect(() => {
  //   console.log('selectedSizeId', selectedSizeId);
  //   console.log('count', count);
  //   console.log('price', detailList?.price);
  //   console.log('cup', cupChoice);
  // }, [selectedSizeId, count, detailList, cupChoice]);

  return (
    <>
      <CategoryContent
        setCategoryName={setCategoryName}
        cartCount={cartCount}
      />
      {detailList && (
        <>
          <div className={cx('product-img')}>
            <img
              src={detailList.temperatureList[temperatureChoice].menuImg}
              alt=''
            />
          </div>
          <div className={cx('product-detail')}>
            <div className={cx('product-name')}>
              {detailList.temperatureList[temperatureChoice].menuName}
            </div>
            <div className={cx('product-english-name')}>
              {detailList.temperatureList[temperatureChoice].menuEngName}
            </div>
            <div className={cx('product-content')}>
              {detailList.temperatureList[temperatureChoice].description}
            </div>
            <div className={cx('product-price')}>
              {addComma(detailList.price)}원
            </div>
            {detailList.temperatureList[0].temperatureId < 66 ? (
              <div className={cx('temp-button')}>
                {detailList.temperatureList.length === 1 ? (
                  <div
                    className={
                      detailList.temperatureList[0].temperature === 'hot'
                        ? cx('only-hot')
                        : cx('only-ice')
                    }
                  >
                    {detailList.temperatureList[0].temperature === 'hot' ? (
                      <div>HOT ONLY</div>
                    ) : (
                      <div>ICED ONLY</div>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className={cx(
                        temperatureChoice === 0 ? 'hot-unclicked' : 'hot',
                      )}
                      onClick={() =>
                        handleTempChoice(
                          'hot',
                          detailList.temperatureList[1].temperatureId,
                        )
                      }
                      onKeyDown={() =>
                        handleTempChoice(
                          'hot',
                          detailList.temperatureList[1].temperatureId,
                        )
                      }
                    >
                      HOT
                    </div>
                    <div
                      className={cx(
                        temperatureChoice === 0 ? 'iced' : 'iced-unclicked',
                      )}
                      onClick={() =>
                        handleTempChoice(
                          'ice',
                          detailList.temperatureList[0].temperatureId,
                        )
                      }
                      onKeyDown={() =>
                        handleTempChoice(
                          'ice',
                          detailList.temperatureList[0].temperatureId,
                        )
                      }
                    >
                      ICED
                    </div>
                  </>
                )}
              </div>
            ) : undefined}
          </div>
        </>
      )}

      <hr className={cx('line')} />
      <div className={cx('product-nutrition')} onClick={handleNutritionOpen}>
        <p>제품영양정보</p>
        <RightArrowBtn className={cx('icon')} />
      </div>
      {detailList && detailList.allergy === '없음' ? undefined : (
        <div className={cx('product-allergy')}>
          <p>알레르기 유발 요인</p>
          <div>{detailList && detailList.allergy}</div>
        </div>
      )}
      <div className={cx('button-box')}>
        <button
          className={cx(
            'order-button',
            soldOutMenu ? 'disable' : '',
            detailList && detailList.temperatureList[0].temperatureId > 66
              ? 'disable'
              : '',
          )}
          type='button'
          onClick={handleOptionOpen}
          disabled={
            soldOutMenu ||
            (detailList && detailList.temperatureList[0].temperatureId > 66)
          }
        >
          {soldOutMenu ||
          (detailList && detailList.temperatureList[0].temperatureId > 66)
            ? '주문 불가능한 상품입니다.'
            : '주문하기'}
        </button>
      </div>
      {myMenuAlert && (
        <MyMenuRenamePopUp
          prevPage='product'
          selectedSizeTxt={selectedSizeTxt}
          temperatureChoice={temperatureChoice}
          detailList={detailList}
          myMenuNameRef={myMenuNameRef}
          cupChoice={cupChoice}
          handleClose={handleClose}
          handleAddMyMenuData={handleAddMyMenuData}
        />
      )}
      <ProductOrder
        open={open}
        onDismiss={onDismiss}
        detailList={detailList}
        sizeOpt={sizeOpt}
        setCupChoice={setCupChoice}
        cupChoice={cupChoice}
        setCartData={setCartData}
        handleAddMyMenu={handleAddMyMenu}
        handleAddCart={handleAddCart}
        handleOrder={handleOrder}
        count={count}
        setCount={setCount}
        selectedSizeTxt={selectedSizeTxt}
        setSelectedSizeTxt={setSelectedSizeTxt}
        cartData={cartData}
        setSelectedSizeId={setSelectedSizeId}
      />
      {!open && <ToolbarList />}
      <ProductNutritionSheet
        nutritionOpen={nutritionOpen}
        onDismiss={onDismiss}
        nutritionInfo={nutritionInfo}
      />
    </>
  );
}

export default productContent;
