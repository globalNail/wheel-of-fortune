export function GameRulesSection() {
  return (
    <section className="rounded-3xl border border-[#ebd7b8] bg-[#fff8ee] p-5 shadow-lg shadow-[#c79a59]/10">
      <h2 className="mb-4 text-lg font-bold text-[#6a4a24] uppercase tracking-wider">Luật chơi chiếc nón kỳ diệu</h2>
      
      <div className="space-y-4 text-[#5f4628]">
        <div className="space-y-1">
          <h3 className="font-bold uppercase tracking-wider text-[#cc7251] text-sm">Vai trò trong game</h3>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li><strong>Đội chơi (Player):</strong> Nhiệm vụ duy nhất là chờ đến lượt và bấm nút <strong>QUAY VÒNG</strong>. Đội chơi sẽ suy nghĩ và đọc to chữ cái/đáp án muốn đoán cho Quản trò (Host).</li>
            <li><strong>Quản trò (Host):</strong> Có quyền bấm chọn chữ cái, nhập đáp án, chuyển lượt và quản lý thời gian trên hệ thống.</li>
          </ul>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold uppercase tracking-wider text-[#cc7251] text-sm">Cách tính điểm</h3>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>Quay vào ô điểm: Nếu đoán đúng chữ cái, đội nhận được <strong>(Điểm ô quay x Số lần chữ cái xuất hiện)</strong>.</li>
            <li>Quay vào <strong>Mất lượt</strong>: Lượt chơi chuyển sang đội kế tiếp.</li>
            <li>Quay vào <strong>Phá sản</strong>: Điểm của đội bị đưa về 0, đồng thời mất lượt.</li>
          </ul>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold uppercase tracking-wider text-[#cc7251] text-sm">Giải mã từ khóa</h3>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>Bất cứ khi nào đang đến lượt của mình, đội chơi có thể yêu cầu giải toàn bộ từ khóa.</li>
            <li>Nếu giải <strong>đúng</strong>: Đội nhận được điểm thưởng giải đáp và trở thành đội chiến thắng ván đấu đó.</li>
            <li>Nếu giải <strong>sai</strong>: Mất lượt ngay lập tức.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
