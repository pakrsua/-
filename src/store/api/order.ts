import { IPurchaseData } from '../../types/order';
import { basicRequest } from './base';

const MENU_SERVICE = '/menu-service';
const ORDER_SERVICE = '/purchase-service';
const STORE_SERVICE = '/store-service';

export const getMenuDetail = async (sizeId: number, cartId: number) => {
  console.log(`${MENU_SERVICE}/size/menu/forPurchase/${sizeId}/${cartId}`);
  const res = await basicRequest.get(
    `${MENU_SERVICE}/size/menu/forPurchase/${sizeId}/${cartId}`,
  );
  return res;
};

export const addOrder = async (data: IPurchaseData, token: string) => {
  const res = await basicRequest.post(
    `${ORDER_SERVICE}/purchase/user`,
    data,
    {
      headers: {
        Authorization: token,
      },
    },
  );
  return res;
};

export const getOrderStatus = async (purchaseId: number) => {
  const res = await basicRequest.get(`${STORE_SERVICE}/order/${purchaseId}`);
  return res;
};

export const getWaitingInfo = async (token: string) => {
  const res = await basicRequest.get(`${STORE_SERVICE}/order/waitingTime/user`, {
    headers: {
      Authorization: token,
    }
  });

  return res;
}

export const getProgressOrder = async (token: string) => {
  const res = await basicRequest.get(`${STORE_SERVICE}/order/orderMenuInProgress`, {
    headers: {
      Authorization: token,
    }
  });
  return res;
}