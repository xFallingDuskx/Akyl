import { ArrowUpIcon } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../../contexts/AuthContext';
import { useBudget } from '../../hooks';
import {
  CashFlowVerbiagePairs,
  URL_PARAM_FORM,
  type BudgetType,
} from '../../lib';
import { useSpace } from '../../store';
import { setTabTitle } from '../../utils';
import ExpenseForm from '../forms/ExpenseForm';
import IncomeForm from '../forms/IncomeForm';
import Dropdown from '../ui/Dropdown';
import HeaderBarTimeWindow from './HeaderBarTimeWindow';

export default function HeaderBar() {
  const { currentUser } = useAuth();
  const [title, cashFlowVerbiage] = useSpace(
    useShallow((state) => [
      state.space.title,
      state.space.config.cashFlowVerbiage,
    ]),
  );
  const { updateSpace } = useSpace();
  const { incomes, expenses } = useBudget();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    updateSpace({ title: newTitle });
    setTabTitle(newTitle);
  };

  const handleOpenForm = (type: BudgetType) => {
    setSearchParams({ [URL_PARAM_FORM]: type });
  };

  const handleCloseForm = () => {
    setSearchParams({});
  };

  return (
    <>
      <div className='bg-surface-light dark:bg-surface-dark relative flex w-full flex-grow items-center justify-between rounded-lg px-4 py-2.5 shadow-md'>
        <input
          value={title || ''}
          onChange={handleTextChange}
          placeholder='Space Title'
          className='text-surface-hover-dark dark:text-surface-hover-light w-96 text-xl font-bold text-ellipsis placeholder:text-gray-500 focus:text-teal-600 focus:outline-none focus:placeholder:text-teal-600/50'
        />
        <div className='flex items-center gap-3 text-sm'>
          <HeaderBarTimeWindow />
          <span className='bg-surface-hover-dark dark:bg-surface-hover-light mx-1 h-6 w-px' />
          <button
            onClick={() => handleOpenForm('income')}
            className='text-surface-light not-dark:bg-inflow not-dark:hover:bg-inflow-darker dark:text-inflow-darker hover:dark:border-inflow-darker rounded border border-transparent px-4 py-2.5 transition'
          >
            add {CashFlowVerbiagePairs[cashFlowVerbiage].in}
          </button>
          <button
            onClick={() => handleOpenForm('expense')}
            className='text-surface-light not-dark:bg-outflow not-dark:hover:bg-outflow-darker dark:text-outflow-darker hover:dark:border-outflow-darker rounded border border-transparent px-4 py-2.5 transition'
          >
            add {CashFlowVerbiagePairs[cashFlowVerbiage].out}
          </button>
        </div>

        {[...incomes, ...expenses].length === 0 && (
          <div className='absolute right-8 -bottom-20 flex animate-pulse flex-col items-center'>
            <ArrowUpIcon />
            <span className='rounded-lg px-4 py-2 text-sm font-medium'>
              add your first budget item~
            </span>
          </div>
        )}

        {currentUser?.email && (
          <small className='absolute bottom-0 left-0 translate-y-full'>
            <span className='mr-1 font-light text-gray-500 dark:text-gray-400'>
              Logged in as
            </span>
            <span>{currentUser?.email}</span>
          </small>
        )}
      </div>

      <Dropdown
        isOpen={Boolean(searchParams.get(URL_PARAM_FORM))}
        onClose={() => handleCloseForm()}
        className='right-0 w-fit max-w-md !p-6'
        closeOnOverlayClick={false}
      >
        {searchParams.get(URL_PARAM_FORM) === 'income' && <IncomeForm />}
        {searchParams.get(URL_PARAM_FORM) === 'expense' && <ExpenseForm />}
      </Dropdown>
    </>
  );
}
