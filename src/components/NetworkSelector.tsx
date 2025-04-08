// components/NetworkSelector.tsx
import { useDispatch } from 'react-redux';
import { setChainId } from '../store/networkSlice';

const NetworkSelector = () => {
  const dispatch = useDispatch();

  const handleChange = (e) => {
    dispatch(setChainId(e.target.value));
  };

  return (
    <select onChange={handleChange}>
      <option value="1666600000">Harmony</option>
      {/* adicionar outras redes */}
    </select>
  );
};
