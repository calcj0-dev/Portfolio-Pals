// 遊んでいる間だけ持つ状態。メモリの中だけで、端末に保存しない（入力した割合は画面を閉じたら消える）

import { emptyInput, type InputState } from '../core/portfolio';

export const session = {
  input: emptyInput() as InputState,
  /** プリセットを押したあと、何も変えていなければそのID（計測の preset 用） */
  presetId: null as string | null,
  /** 直前の結果のタイプID */
  resultType: null as string | null,
};
