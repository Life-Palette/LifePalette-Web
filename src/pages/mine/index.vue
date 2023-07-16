<script setup></script>

<template>
  <div class="h-full w-full gap-5 flex flex-col bg-red-400">
    <div class="content">
      <div class="top">
        <div class="topBox">
          <button class="Upload">
            <svg t="1688396095009" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="4082" width="25" height="25">
              <path
                d="M184.21164 711.56261l23.477954 54.179894h581.530865l32.507936-3.611993 3.611993-50.567901zM592.366843 411.767196l-178.793651 178.793651c23.477954 23.477954 55.985891 39.731922 92.10582 39.731922 70.433862 0 126.419753-55.985891 126.419753-126.419753 0-36.119929-16.253968-68.627866-39.731922-92.10582z"
                fill="#C0EAFF" p-id="4083"></path>
              <path
                d="M791.026455 787.414462H232.973545c-36.119929 0-66.821869-30.70194-66.82187-66.821869V435.24515c0-34.313933 27.089947-61.40388 61.403881-61.40388h36.119929c12.641975 0 25.283951-9.029982 30.70194-21.671958l21.671958-57.791887c12.641975-36.119929 46.955908-59.597884 86.68783-59.597884h222.137567c37.925926 0 72.239859 23.477954 86.68783 59.597884l21.671958 57.791887c5.417989 12.641975 16.253968 21.671958 30.70194 21.671958h36.119929c34.313933 0 61.40388 27.089947 61.40388 61.40388v283.541446c-3.611993 37.925926-34.313933 68.627866-70.433862 68.627866zM227.555556 411.767196c-14.447972 0-25.283951 10.835979-25.283951 25.28395v283.541447c0 16.253968 14.447972 30.70194 30.70194 30.70194h558.05291c16.253968 0 30.70194-14.447972 30.70194-30.70194V435.24515c0-14.447972-10.835979-25.283951-25.283951-25.283951h-36.119929c-28.895944 0-54.179894-18.059965-65.015873-45.149912L673.636684 307.0194c-7.223986-21.671958-28.895944-36.119929-52.373897-36.119929H400.931217c-23.477954 0-43.343915 14.447972-52.373898 36.119929l-21.671957 57.791887c-9.029982 27.089947-36.119929 45.149912-65.015873 45.149912h-34.313933z"
                fill="#1F87DD" p-id="4084"></path>
              <path
                d="M511.097002 650.15873c-79.463845 0-144.479718-65.015873-144.479718-144.479718s65.015873-144.479718 144.479718-144.479717 144.479718 65.015873 144.479718 144.479717c1.805996 79.463845-63.209877 144.479718-144.479718 144.479718z m0-254.645502c-59.597884 0-108.359788 48.761905-108.359789 108.359788s48.761905 108.359788 108.359789 108.359788 108.359788-48.761905 108.359788-108.359788-46.955908-108.359788-108.359788-108.359788zM778.38448 484.007055h-68.627866c-10.835979 0-18.059965-7.223986-18.059965-18.059965s7.223986-18.059965 18.059965-18.059965h68.627866c10.835979 0 18.059965 7.223986 18.059964 18.059965s-7.223986 18.059965-18.059964 18.059965zM832.564374 724.204586H538.186949c-10.835979 0-18.059965-7.223986-18.059965-18.059965s7.223986-18.059965 18.059965-18.059965h294.377425c10.835979 0 18.059965 7.223986 18.059965 18.059965s-7.223986 18.059965-18.059965 18.059965zM451.499118 724.204586h-39.731922c-10.835979 0-18.059965-7.223986-18.059965-18.059965s7.223986-18.059965 18.059965-18.059965H451.499118c10.835979 0 18.059965 7.223986 18.059965 18.059965s-9.029982 18.059965-18.059965 18.059965zM317.855379 724.204586H198.659612c-10.835979 0-18.059965-7.223986-18.059965-18.059965s7.223986-18.059965 18.059965-18.059965h121.001764c10.835979 0 18.059965 7.223986 18.059964 18.059965s-9.029982 18.059965-19.865961 18.059965z"
                fill="#1F87DD" p-id="4085"></path>
            </svg>上传图片
          </button>
          <div class="IPUpload">
            <svg t="1688396603755" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="8447" width="12" height="12">
              <path
                d="M511.577329 1.375605c-217.031089 0-393.108467 163.421816-393.108467 364.888923 0 201.388501 393.108467 657.381746 393.108467 657.381745s393.029861-455.993245 393.029861-657.381745c0-201.467107-176.077378-364.888923-393.029861-364.888923z m0 599.370538c-142.748446 0-258.456437-107.454364-258.456437-239.748216 0-132.451063 115.707991-239.905427 258.456437-239.905427 142.66984 0 258.377831 107.454364 258.377831 239.905427 0 132.293851-115.707991 239.748215-258.377831 239.748216z"
                fill="#0197D1" p-id="8448"></path>
            </svg>IP 属地未知
          </div>
        </div>
      </div>
    </div>
    <div class="information">
      <div class="head-ico">
        登陆默认头像
      </div>
      <div class="in-detail">
        <div class="Username">
          Name
        </div>
        <div class="sex">♂</div>
        <div class="My-look">
          <svg t="1688398095748" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="2095" width="15" height="15">
            <path
              d="M966.4 323.2c-9.6-9.6-25.6-9.6-35.2 0l-416 416-425.6-416c-9.6-9.6-25.6-9.6-35.2 0-9.6 9.6-9.6 25.6 0 35.2l441.6 432c9.6 9.6 25.6 9.6 35.2 0l435.2-432C976 345.6 976 332.8 966.4 323.2z"
              p-id="2096"></path>
          </svg>
          <span class="My-detail">查看详细资料</span>
        </div>
      </div>
      <div class="My-edit">编辑个人资料</div>
      <div class="My-room">
        <div>谁看过我</div>
        <div>我看过谁</div>
        <div>被挡访客</div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.content {
  width: 90%;
  margin: 0 auto;
  background-color: rgb(240, 192, 229);
}

.top {
  background-image: url("https://avatars.githubusercontent.com/u/66096254?v=4");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 160px;
  transition: all 0.5s ease-in-out;

  &:hover {
    background-size: cover;

    width: 100%;

    height: 285px;

  }

  .topBox {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap-reverse;
    box-sizing: border-box;

    .Upload {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 120px;
      height: 40px;
      margin: 20px;
      background: none;
      border: 1px solid #fff;
      border-radius: 3px;
      cursor: pointer;
      text-align: center;
    }

    .IPUpload {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 10px 30px;
      width: 100px;
      border-radius: 3px;
      padding: 5px;
      font-size: 14px;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      border: 1px solid #fff;
      background-color: none;
    }
  }
}

.information {
  width: 90%;
  height: 130px;
  margin: 0 auto;
  background-color: rgb(248, 146, 224);
  display: flex;

  .head-ico {
    width: 150px;
    height: 100%;
    background-color: #fff;
  }

  .in-detail {
    width: 160px;
    background-color: aqua;
    display: flex;
    flex-direction: column;

    .Username {
      height: 50px;
      background-color: red;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .sex {
    height: 30px;
  }

  .My-look {
    flex: 1;
    background-color: blue;
  }

  .My-detail {
    background-color: brown;
  }
}
</style>
