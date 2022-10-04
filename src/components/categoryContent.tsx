import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import Image from 'next/image';
import styles from '../../styles/pages/categoryPage.module.scss';
import CategoryItem from './categoryItem';
// import { categoryFoodList } from '../../public/assets/datas/categoryFoodList';
import axios from 'axios';

const cx = classNames.bind(styles);

interface ICategory {
  id: number;
  categoryLName: string;
}
interface IDrinkCategory {
  categorySImg: string;
  categorySName: string;
}

function categoryContent({ setCategoryName }: { setCategoryName: any }) {
  const [isClick, setIsClick] = useState('NEW');
  const [categoryL, setCategoryL] = useState<ICategory[]>([]);
  const [categoryLName, setCategoryLName] = useState('음료');
  const [categoryLId, setCategoryLId] = useState(1);
  const [categoryDrinkList, setCategoryDrinkList] = useState<IDrinkCategory[]>(
    [],
  );
  const [categoryFoodList, setCategoryFoodList] = useState<IDrinkCategory[]>(
    [],
  );
  const handleChangeCategory = (name: string, id: number) => {
    console.log(name);
    setCategoryLName(name);
    console.log(id);
    axios
      .get(`${process.env.NEXT_PUBLIC_MENU_BASE_URL}/${id}/categoryS`)
      .then(res => {
        setCategoryDrinkList(res.data.data);
        setCategoryFoodList(res.data.data);

        console.log(categoryDrinkList);
        console.log(categoryFoodList);
      });
  };
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_MENU_BASE_URL}/categoryL`)
      .then(res => {
        setCategoryL(res.data.data);
      });
    axios
      .get(`${process.env.NEXT_PUBLIC_MENU_BASE_URL}/${categoryLId}/categoryS`)
      .then(res => {
        setCategoryDrinkList(res.data.data);
      });
  }, []);
  return (
    <>
      <div className={cx('menu-bar')}>
        <div
          className={
            categoryLName === '음료'
              ? cx('state-bar-drink')
              : cx('state-bar-food')
          }
        />
        <ul>
          {categoryL &&
            categoryL.map(item => (
              <li
                key={item.id}
                role='menuitem'
                onClick={() => {
                  handleChangeCategory(item.categoryLName, item.id);
                }}
                onKeyDown={() => {
                  handleChangeCategory(item.categoryLName, item.id);
                }}
              >
                {item.categoryLName}
              </li>
            ))}
        </ul>
        <div className={cx('search-bar')}>
          <div />
          <div className={cx('search-icon')}>
            <Image
              src='/assets/svg/icon-search.svg'
              alt='search'
              width={24}
              height={21}
            />
          </div>
        </div>
        <div>
          <Image
            src='/assets/svg/icon-cart.svg'
            alt='cart'
            width={24}
            height={21}
          />
        </div>
      </div>
      <div className={cx('menu-category')}>
        {categoryLName === '음료' ? (
          <ul>
            {categoryDrinkList &&
              categoryDrinkList.map(item => {
                return (
                  <CategoryItem
                    key={item.categorySName}
                    list={item}
                    setIsClick={setIsClick}
                    isClick={isClick}
                    setCategoryName={setCategoryName}
                  />
                );
              })}
          </ul>
        ) : (
          <ul>
            {categoryFoodList &&
              categoryFoodList.map(item => {
                return (
                  <CategoryItem
                    key={item.categorySName}
                    list={item}
                    setIsClick={setIsClick}
                    isClick={isClick}
                    setCategoryName={setCategoryName}
                  />
                );
              })}
          </ul>
        )}
      </div>
    </>
  );
}

export default categoryContent;
