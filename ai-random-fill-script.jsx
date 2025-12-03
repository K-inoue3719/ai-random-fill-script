/*
  RandomColorFill.jsx
  選択したオブジェクト（グループ・複合パス対応）にランダムな塗り色を設定するスクリプト
*/

(function() {
    // ドキュメントが開かれていない場合は終了
    if (app.documents.length === 0) {
        alert("ドキュメントが開かれていません。");
        return;
    }

    var doc = app.activeDocument;
    var sel = doc.selection;

    // 何も選択されていない場合は終了
    if (sel.length === 0) {
        alert("対象のオブジェクトを選択してから実行してください。");
        return;
    }

    // カラーモードの確認 (RGB or CMYK)
    var isRGB = (doc.documentColorSpace === DocumentColorSpace.RGB);

    // ランダムな色を生成する関数
    function getRandomColor() {
        if (isRGB) {
            var rgbCol = new RGBColor();
            rgbCol.red   = Math.floor(Math.random() * 256);
            rgbCol.green = Math.floor(Math.random() * 256);
            rgbCol.blue  = Math.floor(Math.random() * 256);
            return rgbCol;
        } else {
            var cmykCol = new CMYKColor();
            cmykCol.cyan    = Math.floor(Math.random() * 101);
            cmykCol.magenta = Math.floor(Math.random() * 101);
            cmykCol.yellow  = Math.floor(Math.random() * 101);
            cmykCol.black   = 0; // 黒が混ざると暗くなるため0に固定（好みで変更可）
            return cmykCol;
        }
    }

    // 再帰的にアイテムを処理する関数
    function processItem(item) {
        // グループの場合：中身をさらに探索
        if (item.typename === "GroupItem") {
            for (var i = 0; i < item.pageItems.length; i++) {
                processItem(item.pageItems[i]);
            }
        } 
        // 複合パスの場合：内部のパス全てに同じ色を塗る（複合パスとしての一体感を保つため）
        else if (item.typename === "CompoundPathItem") {
            var randColor = getRandomColor();
            var paths = item.pathItems;
            
            // 複合パス内の最初のパスに対してスタイルを適用（Illustratorの挙動に準拠）
            // ※安全のため全パスに適用フラグを立てつつ、色は統一します
            for (var j = 0; j < paths.length; j++) {
                paths[j].filled = true;
                paths[j].fillColor = randColor;
            }
        } 
        // 通常のパスの場合
        else if (item.typename === "PathItem") {
            // ガイドやクリッピングマスクは除外
            if (!item.guides && !item.clipping) {
                item.filled = true;
                item.fillColor = getRandomColor();
            }
        }
        // テキストフレームなどの場合（必要であればここに追加）
    }

    // 選択された各アイテムに対して処理を実行
    for (var i = 0; i < sel.length; i++) {
        processItem(sel[i]);
    }

})();