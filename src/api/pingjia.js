// 模拟后端API地址，后续连接真实后端时替换
const API_BASE_URL = '/api'; // 实际部署时替换为真实API地址

/**
 * 提交评价数据
 * @param {Object} data - 评价数据
 * @returns {Promise} - 返回Promise对象
 */
export function submitEvaluation(data) {
    // 模拟网络请求延迟
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 模拟成功提交，90%的概率成功，10%的概率失败
            if (Math.random() < 0.9) {
                console.log('模拟提交成功:', data);
                resolve({
                    code: 200,
                    message: '评价提交成功',
                    data: {
                        id: 'eval_' + Date.now(), // 生成唯一ID模拟后端返回
                        ...data,
                        submitTime: new Date().toISOString()
                    }
                });
            } else {
                console.error('模拟提交失败:', data);
                reject(new Error('服务器繁忙，请稍后再试'));
            }
        }, 1000); // 模拟1秒网络延迟
    });

    // 实际连接后端时的代码如下:
    /*
    return axios.post(`${API_BASE_URL}/evaluations`, data)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        throw new Error(error.response?.data?.message || '提交评价失败');
      });
    */
}